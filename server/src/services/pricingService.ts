import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PricingLineItem {
  catalogItemId?: string;
  code: string;
  name: string;
  description: string;
  unitType: string;
  quantity: number;
  unitRate: number;
  total: number;
  isCustom: boolean;
  unmatchedReason?: string;
}

export interface PricingCalculationResult {
  items: PricingLineItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  unmatchedCount: number;
}

export class PricingService {
  static async matchAndCalculatePricing(
    scopeItems: string[],
    deliverables: Array<{ title: string; description: string; quantity?: string | number }>,
    taxPercent: number = 10.0,
    discountAmount: number = 0.0
  ): Promise<PricingCalculationResult> {
    const catalog = await prisma.catalogItem.findMany({
      where: { active: true },
    });

    const items: PricingLineItem[] = [];
    const matchedCatalogCodes = new Set<string>();

    const allRequirements = [
      ...scopeItems.map(s => ({ text: s, type: 'scope' })),
      ...deliverables.map(d => ({ text: `${d.title}: ${d.description}`, type: 'deliverable' })),
    ];

    for (const req of allRequirements) {
      const lowerReq = req.text.toLowerCase();
      let bestMatch: typeof catalog[0] | null = null;
      let highestScore = 0;

      for (const catItem of catalog) {
        const keywords = catItem.keywords.split(',').map(k => k.trim().toLowerCase());
        let score = 0;

        for (const kw of keywords) {
          if (kw.length > 2 && lowerReq.includes(kw)) {
            score += 2;
          }
        }

        if (catItem.name.toLowerCase().split(' ').some(w => w.length > 3 && lowerReq.includes(w))) {
          score += 3;
        }

        if (score > highestScore && score >= 2) {
          highestScore = score;
          bestMatch = catItem;
        }
      }

      if (bestMatch && !matchedCatalogCodes.has(bestMatch.code)) {
        matchedCatalogCodes.add(bestMatch.code);
        
        let quantity = 40; // Default 40 hours for hourly services
        if (bestMatch.unitType === 'milestone') quantity = 1;
        if (bestMatch.unitType === 'month') quantity = 3;
        if (bestMatch.unitType === 'day') quantity = 10;

        items.push({
          catalogItemId: bestMatch.id,
          code: bestMatch.code,
          name: bestMatch.name,
          description: bestMatch.description,
          unitType: bestMatch.unitType,
          quantity,
          unitRate: bestMatch.defaultRate,
          total: quantity * bestMatch.defaultRate,
          isCustom: false,
        });
      } else if (!bestMatch && req.type === 'scope') {
        // Flag unmatched requirements as requiring custom quote
        items.push({
          code: 'CUSTOM-QUOTE',
          name: req.text.length > 50 ? `${req.text.substring(0, 47)}...` : req.text,
          description: `Custom requirement identified from client request: "${req.text}"`,
          unitType: 'custom_estimate',
          quantity: 1,
          unitRate: 0,
          total: 0,
          isCustom: true,
          unmatchedReason: 'Requirement does not match standard catalog entries. Requires manual pricing.',
        });
      }
    }

    // If no catalog items matched at all, provide a baseline engineering package
    if (items.filter(i => !i.isCustom).length === 0 && catalog.length > 0) {
      const defaultItem = catalog[0];
      items.unshift({
        catalogItemId: defaultItem.id,
        code: defaultItem.code,
        name: defaultItem.name,
        description: defaultItem.description,
        unitType: defaultItem.unitType,
        quantity: 40,
        unitRate: defaultItem.defaultRate,
        total: 40 * defaultItem.defaultRate,
        isCustom: false,
      });
    }

    return this.calculateTotals(items, taxPercent, discountAmount);
  }

  static calculateTotals(
    items: PricingLineItem[],
    taxPercent: number = 10.0,
    discountAmount: number = 0.0
  ): PricingCalculationResult {
    const updatedItems = items.map(item => ({
      ...item,
      total: Number((item.quantity * item.unitRate).toFixed(2)),
    }));

    const subtotal = Number(updatedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));
    const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
    const totalAmount = Number(Math.max(0, subtotal + taxAmount - discountAmount).toFixed(2));
    const unmatchedCount = updatedItems.filter(i => i.isCustom).length;

    return {
      items: updatedItems,
      subtotal,
      taxPercent,
      taxAmount,
      discountAmount,
      totalAmount,
      unmatchedCount,
    };
  }
}
