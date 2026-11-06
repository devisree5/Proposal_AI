import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../services/emailService.js';
import { PricingService } from '../services/pricingService.js';

const prisma = new PrismaClient();

export class EmailController {
  static async getEmails(req: Request, res: Response): Promise<void> {
    try {
      const emails = await prisma.emailRequest.findMany({
        orderBy: { receivedAt: 'desc' },
        include: {
          extraction: true,
          proposals: {
            select: {
              id: true,
              proposalNumber: true,
              status: true,
              totalAmount: true,
              templateId: true,
              createdAt: true,
            },
          },
        },
      });
      res.json({ success: true, data: emails });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getEmailById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const email = await prisma.emailRequest.findUnique({
        where: { id },
        include: {
          extraction: true,
          proposals: true,
        },
      });

      if (!email) {
        res.status(404).json({ success: false, error: 'Email inquiry not found' });
        return;
      }

      res.json({ success: true, data: email });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async checkInbox(req: Request, res: Response): Promise<void> {
    try {
      const result = await EmailService.checkIncomingEmails();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async simulateInbound(req: Request, res: Response): Promise<void> {
    try {
      const { scenario, customData } = req.body;
      const result = await EmailService.simulateInboundEmail(scenario, customData);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateExtraction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        clientName,
        companyName,
        contactEmail,
        contactPhone,
        projectName,
        projectDescription,
        scopeItems,
        deliverables,
        expectedTimeline,
        budget,
        missingOrUnclear,
        isVerified,
      } = req.body;

      const updated = await prisma.requirementExtraction.update({
        where: { id },
        data: {
          clientName,
          companyName,
          contactEmail,
          contactPhone,
          projectName,
          projectDescription,
          scopeItems: Array.isArray(scopeItems) ? JSON.stringify(scopeItems) : scopeItems,
          deliverables: Array.isArray(deliverables) ? JSON.stringify(deliverables) : deliverables,
          expectedTimeline,
          budget,
          missingOrUnclear: Array.isArray(missingOrUnclear) ? JSON.stringify(missingOrUnclear) : missingOrUnclear,
          isVerified: Boolean(isVerified),
        },
      });

      // Recalculate suggested pricing matching with updated scope
      const parsedScope = Array.isArray(scopeItems) ? scopeItems : JSON.parse(scopeItems || '[]');
      const parsedDeliverables = Array.isArray(deliverables) ? deliverables : JSON.parse(deliverables || '[]');

      const pricing = await PricingService.matchAndCalculatePricing(parsedScope, parsedDeliverables);

      res.json({ success: true, data: updated, suggestedPricing: pricing });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
