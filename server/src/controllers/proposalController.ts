import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { PdfService } from '../services/pdfService.js';
import { PricingService } from '../services/pricingService.js';
import { EmailService } from '../services/emailService.js';
import { config } from '../config/index.js';
import { ProposalTemplateData } from '../templates/modernMinimalist.js';

const prisma = new PrismaClient();

export class ProposalController {
  static async getProposals(req: Request, res: Response): Promise<void> {
    try {
      const proposals = await prisma.proposal.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          emailRequest: {
            select: {
              id: true,
              subject: true,
              senderEmail: true,
              receivedAt: true,
            },
          },
        },
      });
      res.json({ success: true, data: proposals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getProposalById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: { emailRequest: true },
      });

      if (!proposal) {
        res.status(404).json({ success: false, error: 'Proposal not found' });
        return;
      }

      res.json({ success: true, data: proposal });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async createProposal(req: Request, res: Response): Promise<void> {
    try {
      const {
        emailRequestId,
        templateId = 'modern-minimalist',
        title,
        companyName = config.company.name,
        companyEmail = config.company.email,
        companyPhone = config.company.phone,
        companyAddress = config.company.address,
        companyLogo,
        clientName,
        clientCompany,
        clientEmail,
        clientPhone,
        overview,
        scopeItems,
        deliverables,
        pricingItems,
        taxPercent = 10.0,
        discountAmount = 0.0,
        timelineWeeks = 6,
        timelineMilestones,
        termsAndConditions,
      } = req.body;

      // Deterministic pricing calculation (AI never invents prices)
      const parsedPricingItems = Array.isArray(pricingItems) ? pricingItems : JSON.parse(pricingItems || '[]');
      const calcResult = PricingService.calculateTotals(
        parsedPricingItems,
        parseFloat(taxPercent) || 10.0,
        parseFloat(discountAmount) || 0.0
      );

      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const proposalNumber = `PROP-${year}-${randomSuffix}`;

      const defaultTerms = `
1. Validity: This proposal and pricing schedule are valid for 30 calendar days from the date of issue.
2. Payment Schedule: 40% initial mobilization deposit upon contract execution, 30% upon midpoint milestone demo, and 30% upon final acceptance and deployment.
3. Intellectual Property: Full ownership of all custom software artifacts, source code, and design assets transfers to the Client upon settlement of the final invoice.
4. Scope Changes: Any additions or enhancements requested outside the outlined Scope of Work will be estimated separately under standard hourly rates.
5. Warranty: Provider warrants all software deliverables against critical defects for 60 days following production launch.
      `.trim();

      const proposal = await prisma.proposal.create({
        data: {
          proposalNumber,
          emailRequestId: emailRequestId || null,
          templateId,
          title: title || 'Professional Software Engineering Proposal',
          companyName,
          companyLogo: companyLogo || null,
          companyEmail,
          companyPhone,
          companyAddress,
          clientName: clientName || 'Client Partner',
          clientCompany: clientCompany || null,
          clientEmail: clientEmail || '',
          clientPhone: clientPhone || null,
          overview: overview || 'Technical proposal outlining project objectives and commercial terms.',
          scopeItems: typeof scopeItems === 'string' ? scopeItems : JSON.stringify(scopeItems || []),
          deliverables: typeof deliverables === 'string' ? deliverables : JSON.stringify(deliverables || []),
          pricingItems: JSON.stringify(calcResult.items),
          subtotal: calcResult.subtotal,
          taxPercent: calcResult.taxPercent,
          taxAmount: calcResult.taxAmount,
          discountAmount: calcResult.discountAmount,
          totalAmount: calcResult.totalAmount,
          timelineWeeks: parseInt(timelineWeeks, 10) || 6,
          timelineMilestones: timelineMilestones
            ? (typeof timelineMilestones === 'string' ? timelineMilestones : JSON.stringify(timelineMilestones))
            : JSON.stringify([
                { phase: 'Discovery & UX Architecture', duration: 'Weeks 1-2', description: 'Requirements lock, user flows, and Figma design prototypes' },
                { phase: 'Core Platform Engineering', duration: 'Weeks 3-5', description: 'Full-stack development, database schema, and third-party integrations' },
                { phase: 'QA, Security & Production Deployment', duration: 'Week 6', description: 'E2E testing, security review, performance audit, and go-live launch' },
              ]),
          termsAndConditions: termsAndConditions || defaultTerms,
          status: 'GENERATED',
        },
      });

      // Update email status if linked
      if (emailRequestId) {
        await prisma.emailRequest.update({
          where: { id: emailRequestId },
          data: { status: 'PROPOSAL_GENERATED' },
        });
      }

      // Generate PDF in background or on demand
      try {
        const templateData = ProposalController.formatTemplateData(proposal, calcResult.items);
        const { filePath } = await PdfService.generatePdf(templateId, templateData);
        await prisma.proposal.update({
          where: { id: proposal.id },
          data: { pdfPath: filePath },
        });
      } catch (pdfErr) {
        console.warn('Initial PDF pre-generation warning (can still generate on download):', pdfErr);
      }

      res.status(201).json({ success: true, data: proposal });
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async previewProposal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { templateId } = req.query;

      const proposal = await prisma.proposal.findUnique({
        where: { id },
      });

      if (!proposal) {
        res.status(404).json({ success: false, error: 'Proposal not found' });
        return;
      }

      const activeTemplate = (templateId as string) || proposal.templateId;
      const items = JSON.parse(proposal.pricingItems || '[]');
      const templateData = ProposalController.formatTemplateData(proposal, items);
      const html = PdfService.renderHtml(activeTemplate, templateData);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async downloadPdf(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const proposal = await prisma.proposal.findUnique({
        where: { id },
      });

      if (!proposal) {
        res.status(404).json({ success: false, error: 'Proposal not found' });
        return;
      }

      const items = JSON.parse(proposal.pricingItems || '[]');
      const templateData = ProposalController.formatTemplateData(proposal, items);
      const { buffer } = await PdfService.generatePdf(proposal.templateId, templateData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${proposal.proposalNumber}.pdf"`);
      res.send(buffer);
    } catch (err: any) {
      console.error('Download PDF error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { recipientEmail, customMessage } = req.body;

      const proposal = await prisma.proposal.findUnique({
        where: { id },
      });

      if (!proposal) {
        res.status(404).json({ success: false, error: 'Proposal not found' });
        return;
      }

      const targetEmail = recipientEmail || proposal.clientEmail;
      if (!targetEmail) {
        res.status(400).json({ success: false, error: 'Recipient email address is required' });
        return;
      }

      // Generate current PDF buffer
      const items = JSON.parse(proposal.pricingItems || '[]');
      const templateData = ProposalController.formatTemplateData(proposal, items);
      const { buffer, filePath } = await PdfService.generatePdf(proposal.templateId, templateData);

      // Send email via Nodemailer
      const result = await EmailService.sendProposalEmail({
        to: targetEmail,
        clientName: proposal.clientName,
        proposalNumber: proposal.proposalNumber,
        title: proposal.title,
        customMessage,
        pdfBuffer: buffer,
        totalAmount: proposal.totalAmount,
      });

      if (!result.success) {
        res.status(500).json({ success: false, error: result.error });
        return;
      }

      // Update proposal status to SENT
      const updated = await prisma.proposal.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          pdfPath: filePath,
        },
      });

      res.json({
        success: true,
        message: `Proposal successfully sent to ${targetEmail}`,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateProposal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        templateId,
        title,
        clientName,
        clientCompany,
        clientEmail,
        clientPhone,
        overview,
        scopeItems,
        deliverables,
        pricingItems,
        taxPercent,
        discountAmount,
        timelineWeeks,
        termsAndConditions,
        status,
      } = req.body;

      let calcResult;
      if (pricingItems) {
        const parsed = Array.isArray(pricingItems) ? pricingItems : JSON.parse(pricingItems);
        calcResult = PricingService.calculateTotals(
          parsed,
          parseFloat(taxPercent) || 10.0,
          parseFloat(discountAmount) || 0.0
        );
      }

      const updated = await prisma.proposal.update({
        where: { id },
        data: {
          ...(templateId && { templateId }),
          ...(title && { title }),
          ...(clientName && { clientName }),
          ...(clientCompany !== undefined && { clientCompany }),
          ...(clientEmail && { clientEmail }),
          ...(clientPhone !== undefined && { clientPhone }),
          ...(overview && { overview }),
          ...(scopeItems && { scopeItems: typeof scopeItems === 'string' ? scopeItems : JSON.stringify(scopeItems) }),
          ...(deliverables && { deliverables: typeof deliverables === 'string' ? deliverables : JSON.stringify(deliverables) }),
          ...(calcResult && {
            pricingItems: JSON.stringify(calcResult.items),
            subtotal: calcResult.subtotal,
            taxPercent: calcResult.taxPercent,
            taxAmount: calcResult.taxAmount,
            discountAmount: calcResult.discountAmount,
            totalAmount: calcResult.totalAmount,
          }),
          ...(timelineWeeks && { timelineWeeks: parseInt(timelineWeeks, 10) }),
          ...(termsAndConditions && { termsAndConditions }),
          ...(status && { status }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  private static formatTemplateData(proposal: any, items: any[]): ProposalTemplateData {
    const createdDate = new Date(proposal.createdAt);
    const validUntilDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    let scopeList: string[] = [];
    try {
      scopeList = JSON.parse(proposal.scopeItems || '[]');
    } catch {
      scopeList = [proposal.scopeItems];
    }

    let delivList: any[] = [];
    try {
      delivList = JSON.parse(proposal.deliverables || '[]');
    } catch {
      delivList = [];
    }

    let milestonesList: any[] = [];
    try {
      milestonesList = JSON.parse(proposal.timelineMilestones || '[]');
    } catch {
      milestonesList = [];
    }

    return {
      proposalNumber: proposal.proposalNumber,
      date: formatDate(createdDate),
      validUntil: formatDate(validUntilDate),
      company: {
        name: proposal.companyName,
        email: proposal.companyEmail,
        phone: proposal.companyPhone,
        address: proposal.companyAddress,
      },
      client: {
        name: proposal.clientName,
        company: proposal.clientCompany || undefined,
        email: proposal.clientEmail,
        phone: proposal.clientPhone || undefined,
      },
      title: proposal.title,
      overview: proposal.overview,
      scopeItems: scopeList,
      deliverables: delivList,
      pricingItems: items,
      subtotal: proposal.subtotal,
      taxPercent: proposal.taxPercent,
      taxAmount: proposal.taxAmount,
      discountAmount: proposal.discountAmount,
      totalAmount: proposal.totalAmount,
      timelineWeeks: proposal.timelineWeeks || undefined,
      milestones: milestonesList,
      termsAndConditions: proposal.termsAndConditions,
    };
  }
}
