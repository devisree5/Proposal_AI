import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PricingService } from '../services/pricingService.js';

const prisma = new PrismaClient();

export class CatalogController {
  static async getCatalog(req: Request, res: Response): Promise<void> {
    try {
      const items = await prisma.catalogItem.findMany({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
      res.json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async createCatalogItem(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, category, description, unitType, defaultRate, keywords } = req.body;
      const item = await prisma.catalogItem.create({
        data: {
          code,
          name,
          category,
          description,
          unitType,
          defaultRate: parseFloat(defaultRate),
          keywords: keywords || '',
        },
      });
      res.status(201).json({ success: true, data: item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateCatalogItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, category, description, unitType, defaultRate, keywords, active } = req.body;
      const item = await prisma.catalogItem.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(category && { category }),
          ...(description && { description }),
          ...(unitType && { unitType }),
          ...(defaultRate !== undefined && { defaultRate: parseFloat(defaultRate) }),
          ...(keywords !== undefined && { keywords }),
          ...(active !== undefined && { active }),
        },
      });
      res.json({ success: true, data: item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async matchPricing(req: Request, res: Response): Promise<void> {
    try {
      const { scopeItems = [], deliverables = [], taxPercent = 10.0, discountAmount = 0.0 } = req.body;
      const result = await PricingService.matchAndCalculatePricing(
        scopeItems,
        deliverables,
        parseFloat(taxPercent),
        parseFloat(discountAmount)
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async calculateTotals(req: Request, res: Response): Promise<void> {
    try {
      const { items = [], taxPercent = 10.0, discountAmount = 0.0 } = req.body;
      const result = PricingService.calculateTotals(
        items,
        parseFloat(taxPercent),
        parseFloat(discountAmount)
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
