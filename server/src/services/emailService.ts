import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { AiExtractorService } from './aiExtractor.js';
import { PricingService } from './pricingService.js';

const prisma = new PrismaClient();

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass.replace(/\s+/g, ''), // Strip spaces from Gmail App Password
        },
      });
    }
    return this.transporter;
  }

  static async sendProposalEmail(params: {
    to: string;
    clientName: string;
    proposalNumber: string;
    title: string;
    customMessage?: string;
    pdfBuffer: Buffer;
    totalAmount: number;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.getTransporter();

      const defaultBody = `
Dear ${params.clientName},

Thank you for contacting us regarding "${params.title}".

We are pleased to present our formal business proposal (#${params.proposalNumber}). We have carefully reviewed your technical specifications and compiled an itemized scope of work, timeline, and investment breakdown.

Please find the detailed proposal document attached as a PDF to this email.

Investment Summary:
• Total Proposed Amount: $${params.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
• Validity: 30 Days from issuance

If you have any questions or would like to adjust the scope, please feel free to reply directly to this email.

Best regards,

Proposal Engineering Team
${config.company.name}
${config.company.email} | ${config.company.phone}
${config.company.address}
      `.trim();

      const mailOptions = {
        from: `"${config.company.name}" <${config.email.user}>`,
        to: params.to,
        subject: `Business Proposal: ${params.title} (Ref #${params.proposalNumber})`,
        text: params.customMessage || defaultBody,
        attachments: [
          {
            filename: `Proposal-${params.proposalNumber}.pdf`,
            content: params.pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      };

      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('Failed to send proposal email:', error);
      return { success: false, error: error.message || 'Email delivery failed' };
    }
  }

  static async checkIncomingEmails(): Promise<{ fetched: number; processed: number; errors: string[] }> {
    // If credentials are missing or placeholder, log and return safe response
    if (!config.email.user || !config.email.pass) {
      return { fetched: 0, processed: 0, errors: ['Email credentials not configured in environment'] };
    }

    try {
      // Dynamic import of imap-simple to handle environments without imap compiled
      const imaps = await import('imap-simple');

      const imapConfig = {
        imap: {
          user: config.email.user,
          password: config.email.pass.replace(/\s+/g, ''),
          host: config.email.imapHost,
          port: config.email.imapPort,
          tls: true,
          authTimeout: 10000,
          tlsOptions: { rejectUnauthorized: false },
        },
      };

      const connection = await imaps.default.connect(imapConfig);
      await connection.openBox('INBOX');

      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      let processed = 0;
      const errors: string[] = [];

      for (const item of messages) {
        try {
          const allParts = item.parts.find(p => p.which === '');
          const idHeader = item.attributes['x-gm-msgid'] || item.attributes.uid || Date.now().toString();
          const parsed = await simpleParser(allParts ? allParts.body : '');

          const messageId = parsed.messageId || `msg-${idHeader}`;
          const senderEmail = parsed.from?.value[0]?.address || 'unknown@example.com';
          const senderName = parsed.from?.value[0]?.name || senderEmail.split('@')[0];
          const subject = parsed.subject || 'Service Inquiry';
          const body = parsed.text || parsed.html || '';

          // Deduplication check
          const existing = await prisma.emailRequest.findUnique({
            where: { messageId },
          });

          if (existing) {
            continue; // Skip duplicate
          }

          // Service request detection keywords
          const isServiceRequest = this.isServiceInquiry(subject, body);
          if (!isServiceRequest) {
            continue;
          }

          // Save email request
          const emailRecord = await prisma.emailRequest.create({
            data: {
              messageId,
              senderName,
              senderEmail,
              subject,
              rawBody: body,
              isServiceRequest: true,
              status: 'EXTRACTING',
            },
          });

          // Extract requirements via Gemini AI
          const extracted = await AiExtractorService.extractRequirements(subject, body, senderEmail, senderName);

          await prisma.requirementExtraction.create({
            data: {
              emailRequestId: emailRecord.id,
              clientName: extracted.clientName,
              companyName: extracted.companyName,
              contactEmail: extracted.contactEmail,
              contactPhone: extracted.contactPhone,
              projectName: extracted.projectName,
              projectDescription: extracted.projectDescription,
              scopeItems: JSON.stringify(extracted.scopeItems),
              deliverables: JSON.stringify(extracted.deliverables),
              expectedTimeline: extracted.expectedTimeline,
              budget: extracted.budget,
              missingOrUnclear: JSON.stringify(extracted.missingOrUnclear),
              rawAiResponse: JSON.stringify(extracted),
              isVerified: false,
            },
          });

          await prisma.emailRequest.update({
            where: { id: emailRecord.id },
            data: { status: 'EXTRACTED' },
          });

          processed++;
        } catch (msgErr: any) {
          errors.push(msgErr.message || 'Error processing email');
        }
      }

      await connection.end();
      return { fetched: messages.length, processed, errors };
    } catch (err: any) {
      console.warn('IMAP check error:', err.message || err);
      return { fetched: 0, processed: 0, errors: [err.message || 'IMAP connection error'] };
    }
  }

  static isServiceInquiry(subject: string, body: string): boolean {
    const text = `${subject} ${body}`.toLowerCase();
    const serviceKeywords = [
      'quote', 'proposal', 'rfp', 'develop', 'build', 'project', 'inquiry',
      'services', 'estimate', 'cost', 'app', 'website', 'software', 'design',
      'consulting', 'features', 'budget', 'timeline', 'pricing', 'hire'
    ];
    return serviceKeywords.some(kw => text.includes(kw));
  }

  static async simulateInboundEmail(scenarioKey?: string, customData?: {
    senderName?: string;
    senderEmail?: string;
    subject?: string;
    body?: string;
  }) {
    const scenarios: Record<string, { senderName: string; senderEmail: string; subject: string; body: string }> = {
      mobile_app: {
        senderName: 'Sarah Jenkins',
        senderEmail: 'sarah.jenkins@healthsync.io',
        subject: 'RFP: HIPAA-Compliant Telehealth Mobile App (iOS & Android)',
        body: `Hi Team,

I am the Head of Product at HealthSync Technologies. We are looking for an experienced engineering partner to develop a cross-platform mobile application (iOS & Android) for our patient-doctor consultation platform.

Key Requirements:
1. Video consultation module with WebRTC
2. Appointment scheduling and Google Calendar sync
3. Secure patient profile and encrypted medical record upload
4. Stripe payment gateway integration for consultation fees
5. HIPAA compliance audit and high-availability cloud infrastructure on AWS

Our expected launch is in 8 weeks, with a target budget of around $25,000 to $35,000.
We need a full breakdown of milestones, deliverables, and engineering hours.

Looking forward to your proposal!

Best regards,
Sarah Jenkins
Head of Product, HealthSync Inc.
Phone: +1 (415) 890-2341`,
      },
      ecommerce_redesign: {
        senderName: 'Marcus Vance',
        senderEmail: 'marcus@vanceapparel.com',
        subject: 'Inquiry: Modern E-Commerce Platform Replatforming & UI/UX Design',
        body: `Hello,

We run Vance Luxury Apparel and currently operate on an outdated WooCommerce store. We need to replatform our store to a modern, headless Next.js frontend with Shopify or custom Node.js backend.

Scope of work required:
- Complete UI/UX redesign in Figma (desktop & mobile)
- High performance storefront with sub-second page loads
- Product filtering, faceted search, and cart drawer
- Integration with Klaviyo email marketing and Inventory ERP
- Automated CI/CD deployment pipeline with 99.9% uptime SLA

We are aiming to kick off next month and want to launch before Q4 holiday traffic.

Please send over your commercial proposal and portfolio references.

Marcus Vance
CEO, Vance Apparel Ltd.`,
      },
      cloud_saas: {
        senderName: 'Elena Rostova',
        senderEmail: 'elena@novadata.ai',
        subject: 'Proposal Request: B2B Enterprise SaaS Architecture & AI Integration',
        body: `Dear Sales Engineering,

NovaData is building an enterprise document intelligence copilot. We require a specialized backend and DevOps engineering team to assist in building out our core infrastructure.

Needed Capabilities:
- Scalable microservices backend in Node.js/Python
- Vector database integration (Pinecone/pgvector) for document RAG
- LLM prompt engineering and API pipeline
- Kubernetes cluster configuration and automated security scanning
- Ongoing monthly support and SLA maintenance retainer

We have a budget pre-approved up to $45,000 and would like to review a detailed technical proposal with deliverable timelines.

Thanks,
Elena Rostova
CTO, NovaData AI`,
      },
    };

    const selected = customData?.subject
      ? {
          senderName: customData.senderName || 'Alex Mercer',
          senderEmail: customData.senderEmail || 'alex@acmecorp.com',
          subject: customData.subject,
          body: customData.body || 'We require web development services.',
        }
      : scenarios[scenarioKey || 'mobile_app'] || scenarios.mobile_app;

    const messageId = `sim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@simulator.local`;

    const emailRecord = await prisma.emailRequest.create({
      data: {
        messageId,
        senderName: selected.senderName,
        senderEmail: selected.senderEmail,
        subject: selected.subject,
        rawBody: selected.body,
        isServiceRequest: true,
        status: 'EXTRACTING',
      },
    });

    // Run AI extraction
    const extracted = await AiExtractorService.extractRequirements(
      selected.subject,
      selected.body,
      selected.senderEmail,
      selected.senderName
    );

    const extractionRecord = await prisma.requirementExtraction.create({
      data: {
        emailRequestId: emailRecord.id,
        clientName: extracted.clientName,
        companyName: extracted.companyName,
        contactEmail: extracted.contactEmail,
        contactPhone: extracted.contactPhone,
        projectName: extracted.projectName,
        projectDescription: extracted.projectDescription,
        scopeItems: JSON.stringify(extracted.scopeItems),
        deliverables: JSON.stringify(extracted.deliverables),
        expectedTimeline: extracted.expectedTimeline,
        budget: extracted.budget,
        missingOrUnclear: JSON.stringify(extracted.missingOrUnclear),
        rawAiResponse: JSON.stringify(extracted),
        isVerified: false,
      },
    });

    // Run automated pricing catalog matching
    const pricing = await PricingService.matchAndCalculatePricing(
      extracted.scopeItems,
      extracted.deliverables
    );

    await prisma.emailRequest.update({
      where: { id: emailRecord.id },
      data: { status: 'EXTRACTED' },
    });

    return {
      email: emailRecord,
      extraction: extractionRecord,
      suggestedPricing: pricing,
    };
  }
}
