import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

export interface ExtractedProposalRequirements {
  clientName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  projectName: string;
  projectDescription: string;
  scopeItems: string[];
  deliverables: Array<{
    title: string;
    description: string;
    quantity?: string | number;
  }>;
  expectedTimeline: string;
  timelineWeeks?: number;
  budget: string;
  missingOrUnclear: string[];
  confidenceScore?: number;
}

export class AiExtractorService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI | null {
    if (!this.genAI && config.geminiApiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      } catch (err) {
        console.warn('Failed to initialize Gemini client:', err);
      }
    }
    return this.genAI;
  }

  static async extractRequirements(
    subject: string,
    emailBody: string,
    senderEmail: string = '',
    senderName: string = ''
  ): Promise<ExtractedProposalRequirements> {
    const prompt = `
You are an expert B2B Technical Sales Engineer and Proposal Analyst.
Analyze the following incoming customer service/product request email and extract comprehensive structured proposal requirements.

EMAIL SUBJECT: "${subject}"
SENDER: "${senderName}" <${senderEmail}>
EMAIL BODY:
"""
${emailBody}
"""

Extract structured data strictly matching this JSON schema:
{
  "clientName": "Primary contact name (infer from sender if missing)",
  "companyName": "Client company or organization name (or 'Client' if unspecified)",
  "contactEmail": "Client contact email address",
  "contactPhone": "Client contact phone number if mentioned, else ''",
  "projectName": "Concise, professional title for the proposed project",
  "projectDescription": "Comprehensive executive summary describing the client's needs, business goals, and problem statement",
  "scopeItems": ["Array of itemized functional requirements, technical specifications, and key features requested"],
  "deliverables": [
    {
      "title": "Specific deliverable name (e.g. 'Figma UI/UX Prototypes', 'REST API Backend')",
      "description": "Concrete specification of this deliverable",
      "quantity": "e.g. '1 Complete System' or '8 Screens' or '1' or '40 Hours'"
    }
  ],
  "expectedTimeline": "Client's expected timeframe or deadline if mentioned, or reasonable estimate (e.g. '6-8 Weeks')",
  "timelineWeeks": 6,
  "budget": "Budget if explicitly mentioned or 'Open for quotation'",
  "missingOrUnclear": [
    "List of missing specifications, ambiguities, or questions that the sales team must clarify with the client"
  ]
}

Return ONLY valid JSON. Do not wrap in markdown backticks or commentary.
`;

    // 1. Try Gemini API
    const client = this.getClient();
    if (client) {
      try {
        const model = client.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return this.sanitizeExtractedData(parsed, subject, senderEmail, senderName);
      } catch (geminiError: any) {
        console.warn('Gemini extraction error (falling back to intelligent rule-based parser):', geminiError.message || geminiError);
      }
    }

    // 2. Intelligent Deterministic Fallback Parser (Robust anti-failure safeguard)
    return this.fallbackHeuristicExtraction(subject, emailBody, senderEmail, senderName);
  }

  private static sanitizeExtractedData(
    parsed: any,
    subject: string,
    senderEmail: string,
    senderName: string
  ): ExtractedProposalRequirements {
    return {
      clientName: parsed.clientName || senderName || 'Valued Client',
      companyName: parsed.companyName || 'Client Organization',
      contactEmail: parsed.contactEmail || senderEmail || '',
      contactPhone: parsed.contactPhone || '',
      projectName: parsed.projectName || subject.replace(/^re:\s*/i, '') || 'Enterprise Software Solution',
      projectDescription: parsed.projectDescription || 'Custom development and deployment services tailored to client specifications.',
      scopeItems: Array.isArray(parsed.scopeItems) && parsed.scopeItems.length > 0
        ? parsed.scopeItems
        : ['Technical architecture and implementation', 'Testing, deployment, and documentation'],
      deliverables: Array.isArray(parsed.deliverables) && parsed.deliverables.length > 0
        ? parsed.deliverables
        : [{ title: 'Full Application Solution', description: 'Complete system ready for production deployment', quantity: '1 Unit' }],
      expectedTimeline: parsed.expectedTimeline || '4 - 6 Weeks',
      timelineWeeks: typeof parsed.timelineWeeks === 'number' ? parsed.timelineWeeks : 6,
      budget: parsed.budget || 'Quote Requested',
      missingOrUnclear: Array.isArray(parsed.missingOrUnclear) ? parsed.missingOrUnclear : [],
      confidenceScore: 0.95,
    };
  }

  public static fallbackHeuristicExtraction(
    subject: string,
    body: string,
    senderEmail: string,
    senderName: string
  ): ExtractedProposalRequirements {
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean);

    // Heuristic company identification
    let companyName = 'Prospective Client';
    const companyMatch = body.match(/(?:from|at|representing|with)\s+([A-Z][a-zA-Z0-9\s]{2,25}(?:Inc|LLC|Corp|Technologies|Solutions|Group|Ltd)?)/i);
    if (companyMatch && companyMatch[1]) {
      companyName = companyMatch[1].trim();
    } else if (senderEmail.includes('@') && !senderEmail.includes('gmail') && !senderEmail.includes('yahoo')) {
      const domain = senderEmail.split('@')[1].split('.')[0];
      companyName = domain.charAt(0).toUpperCase() + domain.slice(1) + ' Inc.';
    }

    // Phone detection
    const phoneMatch = body.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Budget detection
    const budgetMatch = body.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?|\b(?:\d{2,3}k|\d{1,2}\s*thousand\s*dollars?)\b/i);
    const budget = budgetMatch ? budgetMatch[0] : 'Open for quotation';

    // Timeline detection
    const timelineMatch = body.match(/\b(?:\d{1,2}\s*(?:weeks?|months?|days?)|asap|q[1-4]\s*\d{4})\b/i);
    const timeline = timelineMatch ? timelineMatch[0] : '4 - 6 Weeks';

    // Scope extraction
    const scopeItems: string[] = [];
    const deliverables: Array<{ title: string; description: string; quantity: string }> = [];
    const missingOrUnclear: string[] = [];

    const lower = body.toLowerCase();
    if (lower.includes('react') || lower.includes('frontend') || lower.includes('ui') || lower.includes('portal') || lower.includes('website')) {
      scopeItems.push('Responsive Frontend Web Application with intuitive UX and cross-browser support');
      deliverables.push({ title: 'Frontend Web Application', description: 'Production-ready React/Next.js dashboard and responsive interfaces', quantity: '1 Application' });
    }
    if (lower.includes('backend') || lower.includes('api') || lower.includes('database') || lower.includes('server')) {
      scopeItems.push('Scalable Backend REST API with secure authentication, business logic, and relational database');
      deliverables.push({ title: 'Backend RESTful API & Database', description: 'Secure API server with PostgreSQL database schema and migrations', quantity: '1 Core Backend' });
    }
    if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android') || lower.includes('app')) {
      scopeItems.push('Cross-platform Mobile Application for iOS and Android devices');
      deliverables.push({ title: 'Mobile Application Package', description: 'Native compilation package for App Store and Google Play testing', quantity: '2 Platforms' });
    }
    if (lower.includes('design') || lower.includes('figma') || lower.includes('wireframe')) {
      scopeItems.push('UI/UX Design, Interactive Figma prototypes, and complete design tokens');
      deliverables.push({ title: 'Figma Design System & Prototypes', description: 'High-fidelity clickable wireframes and complete component library', quantity: '1 Design System' });
    }
    if (lower.includes('cloud') || lower.includes('aws') || lower.includes('devops') || lower.includes('docker') || lower.includes('deploy')) {
      scopeItems.push('Automated CI/CD Pipeline and Cloud Hosting Architecture setup');
      deliverables.push({ title: 'CI/CD Cloud Deployment Pipeline', description: 'Automated GitHub Actions workflows and Docker containerization', quantity: '1 Pipeline' });
    }

    if (scopeItems.length === 0) {
      scopeItems.push('End-to-end custom application development and deployment according to technical specifications');
      deliverables.push({ title: 'Custom Software MVP', description: 'Production-ready software build meeting business objectives', quantity: '1 Complete System' });
    }

    // Missing information check
    if (!budgetMatch) {
      missingOrUnclear.push('Client budget constraint was not specified in the email.');
    }
    if (!phoneMatch) {
      missingOrUnclear.push('Direct telephone contact number was not provided.');
    }
    if (!timelineMatch) {
      missingOrUnclear.push('Target launch date or milestone schedule requires confirmation.');
    }

    return {
      clientName: senderName || 'Valued Client',
      companyName,
      contactEmail: senderEmail || 'client@example.com',
      contactPhone: phone,
      projectName: subject.replace(/^re:\s*/i, '').replace(/^inquiry:\s*/i, '') || 'Custom Technology Solution',
      projectDescription: lines.slice(0, 3).join(' ') || 'Custom software development and technical implementation.',
      scopeItems,
      deliverables,
      expectedTimeline: timeline,
      timelineWeeks: 6,
      budget,
      missingOrUnclear,
      confidenceScore: 0.88,
    };
  }
}
