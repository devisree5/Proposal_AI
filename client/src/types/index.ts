export interface EmailRequest {
  id: string;
  messageId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  rawBody: string;
  receivedAt: string;
  status: 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'PROPOSAL_GENERATED' | 'SENT' | 'ARCHIVED';
  isServiceRequest: boolean;
  extraction?: RequirementExtraction | null;
  proposals?: Array<{
    id: string;
    proposalNumber: string;
    status: string;
    totalAmount: number;
    templateId: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface RequirementExtraction {
  id: string;
  emailRequestId: string;
  clientName?: string | null;
  companyName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  projectName: string;
  projectDescription: string;
  scopeItems: string; // JSON string array
  deliverables: string; // JSON string array of { title, description, quantity }
  expectedTimeline?: string | null;
  budget?: string | null;
  missingOrUnclear?: string | null; // JSON string array
  rawAiResponse?: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  unitType: string;
  defaultRate: number;
  keywords: string;
  active: boolean;
}

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

export interface Proposal {
  id: string;
  proposalNumber: string;
  emailRequestId?: string | null;
  templateId: 'modern-minimalist' | 'corporate-executive' | 'creative-studio';
  title: string;
  companyName: string;
  companyLogo?: string | null;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail: string;
  clientPhone?: string | null;
  overview: string;
  scopeItems: string;
  deliverables: string;
  pricingItems: string;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  timelineWeeks?: number | null;
  timelineMilestones?: string | null;
  termsAndConditions: string;
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  pdfPath?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  emailRequest?: EmailRequest | null;
}
