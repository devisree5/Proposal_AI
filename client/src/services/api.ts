import axios from 'axios';
import { EmailRequest, Proposal, CatalogItem, PricingLineItem } from '../types';

const API_ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
const BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Seed Catalog for fallback offline mode
export const DEFAULT_CATALOG: CatalogItem[] = [
  {
    id: 'cat-1',
    code: 'ENG-FE-REACT',
    name: 'Frontend Web App Development (React/Next.js)',
    category: 'Engineering',
    description: 'High-performance responsive UI using React/Next.js and Tailwind CSS.',
    unitType: 'hour',
    defaultRate: 95.0,
    keywords: 'frontend, react, nextjs, web app, ui, portal, user interface',
    isActive: true,
  },
  {
    id: 'cat-2',
    code: 'ENG-BE-NODE',
    name: 'Backend API & Microservices Development',
    category: 'Engineering',
    description: 'Scalable RESTful / GraphQL API services built with Node.js/Python and Prisma.',
    unitType: 'hour',
    defaultRate: 110.0,
    keywords: 'backend, api, node, python, database, rest, microservices',
    isActive: true,
  },
  {
    id: 'cat-3',
    code: 'ENG-MOB-FLUT',
    name: 'Mobile Application Development (iOS & Android)',
    category: 'Engineering',
    description: 'Cross-platform mobile application engineering with native features.',
    unitType: 'hour',
    defaultRate: 120.0,
    keywords: 'mobile, ios, android, app, flutter, react native',
    isActive: true,
  },
  {
    id: 'cat-4',
    code: 'ENG-FULLSTACK-MVP',
    name: 'Full-Stack MVP Delivery Package',
    category: 'Engineering',
    description: 'End-to-end turnkey MVP build including frontend, backend, and database.',
    unitType: 'milestone',
    defaultRate: 8500.0,
    keywords: 'mvp, fullstack, end-to-end, prototype, complete app',
    isActive: true,
  },
  {
    id: 'cat-5',
    code: 'DES-UIUX-PRO',
    name: 'Comprehensive UI/UX Design & User Research',
    category: 'Design',
    description: 'User personas, interactive wireframes, and clickable Figma prototypes.',
    unitType: 'hour',
    defaultRate: 85.0,
    keywords: 'design, ui, ux, wireframe, figma, prototype',
    isActive: true,
  },
  {
    id: 'cat-6',
    code: 'DES-DESIGN-SYS',
    name: 'Enterprise Design System & Brand Guidelines',
    category: 'Design',
    description: 'Component tokens, color palettes, and brand identity typography standards.',
    unitType: 'milestone',
    defaultRate: 3500.0,
    keywords: 'design system, component library, branding, style guide',
    isActive: true,
  },
  {
    id: 'cat-7',
    code: 'OPS-CLOUD-ARCH',
    name: 'Cloud Infrastructure & Server Architecture (AWS/GCP)',
    category: 'Cloud & DevOps',
    description: 'Secure, high-availability cloud architecture setup, VPC, and database clustering.',
    unitType: 'hour',
    defaultRate: 130.0,
    keywords: 'cloud, aws, gcp, azure, infrastructure, devops, hosting',
    isActive: true,
  },
  {
    id: 'cat-8',
    code: 'OPS-CI-CD',
    name: 'CI/CD Automated Deployment Pipeline',
    category: 'Cloud & DevOps',
    description: 'GitHub Actions automated build, test, and zero-downtime deployment workflows.',
    unitType: 'milestone',
    defaultRate: 2500.0,
    keywords: 'ci/cd, pipeline, deployment, github actions, automated deploy',
    isActive: true,
  },
  {
    id: 'cat-9',
    code: 'QA-E2E-TEST',
    name: 'Automated QA & E2E Testing Suite',
    category: 'Quality Assurance',
    description: 'Test coverage including unit tests and Playwright/Cypress end-to-end flows.',
    unitType: 'hour',
    defaultRate: 75.0,
    keywords: 'qa, testing, quality assurance, automation, test suite',
    isActive: true,
  },
  {
    id: 'cat-10',
    code: 'SEC-AUDIT',
    name: 'Security Audit & Vulnerability Assessment',
    category: 'Security',
    description: 'OWASP top 10 compliance audit, vulnerability scanning, and penetration testing.',
    unitType: 'milestone',
    defaultRate: 4200.0,
    keywords: 'security, audit, pentest, vulnerability, compliance, hipaa',
    isActive: true,
  },
  {
    id: 'cat-11',
    code: 'SUP-SLA-MONTH',
    name: 'Monthly Managed Support & Maintenance SLA',
    category: 'Maintenance',
    description: '24/7 uptime monitoring, critical security patches, and 4-hour response SLA.',
    unitType: 'month',
    defaultRate: 1800.0,
    keywords: 'support, maintenance, sla, retainer, monitoring',
    isActive: true,
  },
  {
    id: 'cat-12',
    code: 'ENG-DATA-MIGRATE',
    name: 'Legacy Database & Schema Migration',
    category: 'Engineering',
    description: 'ETL script pipeline, relational data validation, and zero-loss schema migration.',
    unitType: 'milestone',
    defaultRate: 3200.0,
    keywords: 'migration, database migration, etl, schema, data transfer',
    isActive: true,
  },
];

// Offline LocalStorage Helpers
const STORAGE_KEYS = {
  EMAILS: 'propflow_emails',
  PROPOSALS: 'propflow_proposals',
  CATALOG: 'propflow_catalog',
};

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// Generate fallback HTML template for offline preview
export function generateOfflineTemplateHtml(proposal: any, templateId: string): string {
  const p = proposal;
  const isMinimalist = templateId === 'modern-minimalist';
  const isExecutive = templateId === 'corporate-executive';
  const isCreative = templateId === 'creative-studio';

  const primaryColor = isExecutive ? '#1e3a8a' : isCreative ? '#6366f1' : '#0f172a';
  const font = isExecutive ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif';

  const rows = (p.pricingItems || []).map((item: any) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; font-weight: 600;">${item.serviceName}</td>
      <td style="padding: 12px 8px; color: #64748b; font-size: 13px;">${item.description || ''}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity} ${item.unitType || 'unit'}</td>
      <td style="padding: 12px 8px; text-align: right;">$${Number(item.unitRate || 0).toLocaleString()}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 700;">$${Number(item.total || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Proposal #${p.proposalNumber}</title>
        <style>
          body { font-family: ${font}; margin: 0; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: ${primaryColor}; }
          .meta { font-size: 13px; color: #64748b; text-align: right; }
          .client-box { background: #f8fafc; border-left: 4px solid ${primaryColor}; padding: 16px; margin-bottom: 24px; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; }
          .totals { margin-top: 24px; margin-left: auto; width: 320px; border-top: 2px solid #e2e8f0; padding-top: 12px; font-size: 14px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .grand-total { font-size: 18px; font-weight: 800; color: ${primaryColor}; border-top: 1px solid #cbd5e1; margin-top: 8px; padding-top: 8px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${primaryColor}20; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span class="badge">${isExecutive ? 'Corporate Executive' : isCreative ? 'Creative Studio' : 'Modern Minimalist'}</span>
            <div class="logo">PropFlow Consulting</div>
            <div style="font-size: 13px; color: #64748b;">Enterprise Technology & AI Solutions</div>
          </div>
          <div class="meta">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">PROPOSAL #${p.proposalNumber}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Valid for: 30 Days</div>
          </div>
        </div>

        <div class="client-box">
          <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">PREPARED FOR:</div>
          <div style="font-size: 18px; font-weight: 700; color: #0f172a;">${p.clientName}</div>
          <div style="color: #334155;">${p.clientCompany} • ${p.clientEmail}</div>
        </div>

        <h2 style="color: ${primaryColor}; margin-top: 30px; font-size: 20px;">${p.title}</h2>
        <p style="color: #475569; line-height: 1.6; font-size: 14px;">${p.overview || ''}</p>

        <h3 style="margin-top: 30px; font-size: 16px; text-transform: uppercase; color: #475569;">Scope of Work & Deliverables</h3>
        <ul style="color: #334155; line-height: 1.8; font-size: 14px;">
          ${(p.scopeItems || []).map((s: string) => `<li>${s}</li>`).join('')}
        </ul>

        <h3 style="margin-top: 30px; font-size: 16px; text-transform: uppercase; color: #475569;">Commercial Investment Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Service Item</th>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Rate</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Subtotal:</span><span>$${Number(p.subtotalAmount || 0).toLocaleString()}</span></div>
          <div class="total-row"><span>Tax (${p.taxPercent || 0}%):</span><span>$${Number(p.taxAmount || 0).toLocaleString()}</span></div>
          ${p.discountAmount ? `<div class="total-row" style="color: #16a34a;"><span>Discount:</span><span>-$${Number(p.discountAmount).toLocaleString()}</span></div>` : ''}
          <div class="total-row grand-total"><span>Total Investment:</span><span>$${Number(p.totalAmount || 0).toLocaleString()}</span></div>
        </div>

        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
          <div>PropFlow AI Proposal Automation • Authorized Signature</div>
          <div>Client Acceptance Signature: _________________________</div>
        </div>
      </body>
    </html>
  `;
}

// Fallback pricing matcher
function fallbackCalculatePricing(scopeItems: string[] = [], deliverables: any[] = []) {
  const catalog = getLocal<CatalogItem[]>(STORAGE_KEYS.CATALOG, DEFAULT_CATALOG);
  const items: PricingLineItem[] = [];
  const text = (scopeItems.join(' ') + ' ' + JSON.stringify(deliverables)).toLowerCase();

  if (text.includes('mobile') || text.includes('ios') || text.includes('android')) {
    const item = catalog.find(c => c.code === 'ENG-MOB-FLUT');
    if (item) {
      items.push({
        catalogItemId: item.id,
        serviceCode: item.code,
        serviceName: item.name,
        category: item.category,
        description: 'Cross-platform iOS and Android application engineering',
        quantity: 120,
        unitType: item.unitType,
        unitRate: item.defaultRate,
        total: 120 * item.defaultRate,
        isCustomQuote: false,
      });
    }
  }

  if (text.includes('frontend') || text.includes('next.js') || text.includes('react') || text.includes('storefront')) {
    const item = catalog.find(c => c.code === 'ENG-FE-REACT');
    if (item) {
      items.push({
        catalogItemId: item.id,
        serviceCode: item.code,
        serviceName: item.name,
        category: item.category,
        description: 'High-performance React/Next.js responsive web application',
        quantity: 80,
        unitType: item.unitType,
        unitRate: item.defaultRate,
        total: 80 * item.defaultRate,
        isCustomQuote: false,
      });
    }
  }

  if (text.includes('backend') || text.includes('api') || text.includes('microservice') || text.includes('database')) {
    const item = catalog.find(c => c.code === 'ENG-BE-NODE');
    if (item) {
      items.push({
        catalogItemId: item.id,
        serviceCode: item.code,
        serviceName: item.name,
        category: item.category,
        description: 'Scalable RESTful API, database schema, and microservices',
        quantity: 60,
        unitType: item.unitType,
        unitRate: item.defaultRate,
        total: 60 * item.defaultRate,
        isCustomQuote: false,
      });
    }
  }

  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('figma')) {
    const item = catalog.find(c => c.code === 'DES-UIUX-PRO');
    if (item) {
      items.push({
        catalogItemId: item.id,
        serviceCode: item.code,
        serviceName: item.name,
        category: item.category,
        description: 'Interactive wireframes, Figma prototypes, and design layouts',
        quantity: 40,
        unitType: item.unitType,
        unitRate: item.defaultRate,
        total: 40 * item.defaultRate,
        isCustomQuote: false,
      });
    }
  }

  if (text.includes('cloud') || text.includes('aws') || text.includes('devops') || text.includes('infrastructure')) {
    const item = catalog.find(c => c.code === 'OPS-CLOUD-ARCH');
    if (item) {
      items.push({
        catalogItemId: item.id,
        serviceCode: item.code,
        serviceName: item.name,
        category: item.category,
        description: 'High availability cloud infrastructure and architecture',
        quantity: 25,
        unitType: item.unitType,
        unitRate: item.defaultRate,
        total: 25 * item.defaultRate,
        isCustomQuote: false,
      });
    }
  }

  if (text.includes('security') || text.includes('hipaa') || text.includes('audit')) {
    const item = catalog.find(c => c.code === 'SEC-AUDIT');
    if (item) {
      items.push({
        catalogItemId: item.id,
        serviceCode: item.code,
        serviceName: item.name,
        category: item.category,
        description: 'OWASP and compliance vulnerability audit and verification',
        quantity: 1,
        unitType: item.unitType,
        unitRate: item.defaultRate,
        total: 1 * item.defaultRate,
        isCustomQuote: false,
      });
    }
  }

  if (items.length === 0) {
    const defaultItem = catalog[0];
    items.push({
      catalogItemId: defaultItem.id,
      serviceCode: defaultItem.code,
      serviceName: defaultItem.name,
      category: defaultItem.category,
      description: 'Core engineering and technical consulting',
      quantity: 50,
      unitType: defaultItem.unitType,
      unitRate: defaultItem.defaultRate,
      total: 50 * defaultItem.defaultRate,
      isCustomQuote: false,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * 10) / 100;
  const totalAmount = subtotal + taxAmount;

  return {
    items,
    subtotal,
    taxPercent: 10,
    taxAmount,
    discountAmount: 0,
    totalAmount,
    currency: 'USD',
  };
}

export const EmailApi = {
  getAll: async () => {
    try {
      const res = await api.get<{ success: boolean; data: EmailRequest[] }>('/emails');
      const data = res.data.data;
      setLocal(STORAGE_KEYS.EMAILS, data);
      return data;
    } catch {
      return getLocal<EmailRequest[]>(STORAGE_KEYS.EMAILS, []);
    }
  },

  getById: async (id: string) => {
    try {
      const res = await api.get<{ success: boolean; data: EmailRequest }>(`/emails/${id}`);
      return res.data.data;
    } catch {
      const list = getLocal<EmailRequest[]>(STORAGE_KEYS.EMAILS, []);
      const found = list.find(e => e.id === id);
      if (!found) throw new Error('Email not found in local cache');
      return found;
    }
  },

  checkInbox: async () => {
    try {
      const res = await api.post<{ success: boolean; data: { fetched: number; processed: number; errors: string[] } }>('/emails/check-inbox');
      return res.data.data;
    } catch {
      return {
        fetched: 0,
        processed: 0,
        errors: ['Backend API not reachable. Live IMAP requires running Express backend on localhost:5000.'],
      };
    }
  },

  simulate: async (scenario?: string, customData?: any) => {
    try {
      const res = await api.post<{ success: boolean; data: { email: EmailRequest; extraction: any; suggestedPricing: any } }>('/emails/simulate', {
        scenario,
        customData,
      });
      const data = res.data.data;
      const existing = getLocal<EmailRequest[]>(STORAGE_KEYS.EMAILS, []);
      setLocal(STORAGE_KEYS.EMAILS, [data.email, ...existing.filter(e => e.id !== data.email.id)]);
      return data;
    } catch (apiErr) {
      // Offline fallback simulator
      const id = 'sim-' + Date.now();
      let senderName = customData?.senderName || 'Sarah Jenkins';
      let senderEmail = customData?.senderEmail || 'sarah.jenkins@healthsync.io';
      let subject = customData?.subject || 'RFP: HIPAA-Compliant Telehealth Mobile App (iOS & Android)';
      let body = customData?.body || '';
      let companyName = 'HealthSync Technologies';
      let projectName = 'HIPAA-Compliant Telehealth Mobile App';
      let scopeItems = [
        'Cross-platform iOS and Android mobile application',
        'WebRTC video consultation and secure chat',
        'Appointment scheduling & Google Calendar sync',
        'HIPAA compliance audit and cloud architecture on AWS',
      ];
      let deliverables = [
        { title: 'Telehealth Mobile App', description: 'Cross-platform app build', quantity: '1 App' },
        { title: 'Backend API & Cloud VPC', description: 'HIPAA cloud infrastructure', quantity: '1 Infrastructure' },
      ];
      let expectedTimeline = '8 Weeks';
      let budget = '$25,000 - $35,000';
      let missingOrUnclear = [
        'Confirmation of merchant payment gateway credentials',
        'Target cloud region for HIPAA compliance audit',
      ];

      if (scenario === 'ecommerce_redesign') {
        senderName = 'Marcus Vance';
        senderEmail = 'marcus@vanceapparel.com';
        subject = 'RFP: Modern E-Commerce Storefront Redesign & Headless Migration';
        companyName = 'Vance Luxury Apparel Ltd.';
        projectName = 'Headless Next.js E-Commerce Replatforming';
        scopeItems = [
          'High-performance Next.js storefront with Tailwind CSS',
          'Figma UI/UX redesign and interactive component library',
          'Klaviyo email marketing and ERP inventory sync',
          'Automated CI/CD deployment pipeline',
        ];
        deliverables = [
          { title: 'Next.js E-Commerce Storefront', description: 'Full storefront UI', quantity: '1 Portal' },
          { title: 'Figma Design System', description: 'Interactive prototypes', quantity: '1 Design System' },
        ];
        expectedTimeline = '6-8 Weeks';
        budget = '$30,000 - $40,000';
        missingOrUnclear = ['Existing ERP API documentation', 'Custom tax and duties rules for EU sales'];
      } else if (scenario === 'cloud_saas') {
        senderName = 'Elena Rostova';
        senderEmail = 'elena@novadata.ai';
        subject = 'Proposal Request: B2B Enterprise SaaS Architecture & AI Integration';
        companyName = 'NovaData AI';
        projectName = 'Enterprise Document Copilot & Microservices Cloud';
        scopeItems = [
          'Scalable microservices backend in Node.js and PostgreSQL',
          'Vector database integration (Pinecone/pgvector) for document RAG',
          'Kubernetes cluster configuration on AWS/GCP',
          'Monthly 24/7 SLA maintenance and monitoring retainer',
        ];
        deliverables = [
          { title: 'Microservices & RAG Pipeline', description: 'Core vector API service', quantity: '1 Cluster' },
          { title: 'Kubernetes Cloud Deployment', description: 'CI/CD and Terraform setup', quantity: '1 Deployment' },
        ];
        expectedTimeline = '10-12 Weeks';
        budget = '$35,000 - $45,000';
        missingOrUnclear = ['Expected document indexing concurrency per minute'];
      }

      const suggestedPricing = fallbackCalculatePricing(scopeItems, deliverables);

      const simulatedEmail: any = {
        id,
        messageId: `<sim-${Date.now()}@propflow.local>`,
        senderName,
        senderEmail,
        subject,
        body,
        status: 'EXTRACTED',
        receivedAt: new Date().toISOString(),
        extraction: {
          id: 'ext-' + id,
          clientName: senderName,
          companyName,
          contactEmail: senderEmail,
          contactPhone: '+1 (555) 234-5678',
          projectName,
          projectDescription: subject,
          scopeItems: JSON.stringify(scopeItems),
          deliverables: JSON.stringify(deliverables),
          expectedTimeline,
          budget,
          missingOrUnclear: JSON.stringify(missingOrUnclear),
          confidenceScore: 0.95,
          isVerified: false,
          suggestedPricing: JSON.stringify(suggestedPricing),
        },
      };

      const existing = getLocal<EmailRequest[]>(STORAGE_KEYS.EMAILS, []);
      setLocal(STORAGE_KEYS.EMAILS, [simulatedEmail, ...existing.filter(e => e.id !== id)]);

      return {
        email: simulatedEmail,
        extraction: simulatedEmail.extraction,
        suggestedPricing,
      };
    }
  },

  updateExtraction: async (id: string, payload: any) => {
    try {
      const res = await api.put<{ success: boolean; data: any; suggestedPricing: any }>(`/emails/extractions/${id}`, payload);
      return res.data;
    } catch {
      const pricing = fallbackCalculatePricing(payload.scopeItems || [], payload.deliverables || []);
      const emails = getLocal<EmailRequest[]>(STORAGE_KEYS.EMAILS, []);
      const updatedEmails = emails.map(e => {
        if (e.extraction && e.extraction.id === id) {
          return {
            ...e,
            extraction: {
              ...e.extraction,
              ...payload,
              scopeItems: JSON.stringify(payload.scopeItems || []),
              deliverables: JSON.stringify(payload.deliverables || []),
              isVerified: true,
              suggestedPricing: JSON.stringify(pricing),
            },
          };
        }
        return e;
      });
      setLocal(STORAGE_KEYS.EMAILS, updatedEmails);
      return { success: true, data: payload, suggestedPricing: pricing };
    }
  },
};

export const ProposalApi = {
  getAll: async () => {
    try {
      const res = await api.get<{ success: boolean; data: Proposal[] }>('/proposals');
      const data = res.data.data;
      setLocal(STORAGE_KEYS.PROPOSALS, data);
      return data;
    } catch {
      return getLocal<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
    }
  },

  getById: async (id: string) => {
    try {
      const res = await api.get<{ success: boolean; data: Proposal }>(`/proposals/${id}`);
      return res.data.data;
    } catch {
      const list = getLocal<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
      const found = list.find(p => p.id === id);
      if (!found) throw new Error('Proposal not found');
      return found;
    }
  },

  create: async (payload: any) => {
    try {
      const res = await api.post<{ success: boolean; data: Proposal }>('/proposals', payload);
      const data = res.data.data;
      const list = getLocal<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
      setLocal(STORAGE_KEYS.PROPOSALS, [data, ...list.filter(p => p.id !== data.id)]);
      return data;
    } catch {
      const id = 'prop-' + Date.now();
      const proposalNumber = `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const subtotal = (payload.pricingItems || []).reduce((acc: number, item: any) => acc + (Number(item.total) || 0), 0);
      const taxPercent = Number(payload.taxPercent || 10);
      const taxAmount = (subtotal * taxPercent) / 100;
      const discountAmount = Number(payload.discountAmount || 0);
      const totalAmount = subtotal + taxAmount - discountAmount;

      const newProposal: any = {
        id,
        proposalNumber,
        templateId: payload.templateId || 'modern-minimalist',
        title: payload.title || 'Technical & Commercial Proposal',
        clientName: payload.clientName || 'Valued Client',
        clientCompany: payload.clientCompany || 'Client Enterprise',
        clientEmail: payload.clientEmail || 'client@example.com',
        companyName: 'PropFlow Solutions Inc.',
        companyEmail: 'borradevisree20@gmail.com',
        overview: payload.overview || 'Comprehensive technology proposal engineered to meet business objectives.',
        scopeItems: payload.scopeItems || [],
        deliverables: payload.deliverables || [],
        pricingItems: payload.pricingItems || [],
        subtotalAmount: subtotal,
        taxPercent,
        taxAmount,
        discountAmount,
        totalAmount,
        currency: 'USD',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const list = getLocal<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
      setLocal(STORAGE_KEYS.PROPOSALS, [newProposal, ...list.filter(p => p.id !== id)]);
      return newProposal;
    }
  },

  update: async (id: string, payload: any) => {
    try {
      const res = await api.put<{ success: boolean; data: Proposal }>(`/proposals/${id}`, payload);
      return res.data.data;
    } catch {
      const list = getLocal<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
      const updated = list.map(p => p.id === id ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p);
      setLocal(STORAGE_KEYS.PROPOSALS, updated);
      const found = updated.find(p => p.id === id);
      return found!;
    }
  },

  getPreviewUrl: (id: string, templateId?: string) => {
    // If running in development with server or if configured:
    const url = `${BASE_URL}/proposals/${id}/preview${templateId ? `?templateId=${templateId}` : ''}`;
    // Check if we have an offline proposal
    const list = getLocal<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
    const found = list.find(p => p.id === id);
    if (found) {
      const html = generateOfflineTemplateHtml(found, templateId || found.templateId);
      return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    }
    return url;
  },

  getDownloadUrl: (id: string) => {
    return `${BASE_URL}/proposals/${id}/download`;
  },

  sendEmail: async (id: string, payload: { recipientEmail?: string; customMessage?: string }) => {
    try {
      const res = await api.post<{ success: boolean; message: string; data: Proposal }>(`/proposals/${id}/send`, payload);
      return res.data;
    } catch {
      // Offline simulated dispatch
      const list = getLocal<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
      let targetProp = list.find(p => p.id === id);
      if (targetProp) {
        targetProp = { ...targetProp, status: 'SENT', updatedAt: new Date().toISOString() };
        setLocal(STORAGE_KEYS.PROPOSALS, list.map(p => p.id === id ? targetProp! : p));
      }
      return {
        success: true,
        message: 'Proposal successfully recorded as SENT! (Note: Live Gmail SMTP delivery requires running Express server with npm run dev:server)',
        data: targetProp || ({} as any),
      };
    }
  },
};

export const CatalogApi = {
  getAll: async () => {
    try {
      const res = await api.get<{ success: boolean; data: CatalogItem[] }>('/catalog');
      const data = res.data.data;
      if (data && data.length > 0) {
        setLocal(STORAGE_KEYS.CATALOG, data);
        return data;
      }
      return DEFAULT_CATALOG;
    } catch {
      return getLocal<CatalogItem[]>(STORAGE_KEYS.CATALOG, DEFAULT_CATALOG);
    }
  },

  create: async (payload: any) => {
    try {
      const res = await api.post<{ success: boolean; data: CatalogItem }>('/catalog', payload);
      return res.data.data;
    } catch {
      const list = getLocal<CatalogItem[]>(STORAGE_KEYS.CATALOG, DEFAULT_CATALOG);
      const newItem: CatalogItem = {
        id: 'cat-' + Date.now(),
        ...payload,
        isActive: true,
      };
      setLocal(STORAGE_KEYS.CATALOG, [...list, newItem]);
      return newItem;
    }
  },

  update: async (id: string, payload: any) => {
    try {
      const res = await api.put<{ success: boolean; data: CatalogItem }>(`/catalog/${id}`, payload);
      return res.data.data;
    } catch {
      const list = getLocal<CatalogItem[]>(STORAGE_KEYS.CATALOG, DEFAULT_CATALOG);
      const updated = list.map(c => c.id === id ? { ...c, ...payload } : c);
      setLocal(STORAGE_KEYS.CATALOG, updated);
      return updated.find(c => c.id === id)!;
    }
  },

  matchPricing: async (scopeItems: string[], deliverables: any[], taxPercent?: number, discountAmount?: number) => {
    try {
      const res = await api.post<{ success: boolean; data: any }>('/catalog/match', {
        scopeItems,
        deliverables,
        taxPercent,
        discountAmount,
      });
      return res.data.data;
    } catch {
      return fallbackCalculatePricing(scopeItems, deliverables);
    }
  },

  calculateTotals: async (items: PricingLineItem[], taxPercent = 10, discountAmount = 0) => {
    try {
      const res = await api.post<{ success: boolean; data: any }>('/catalog/calculate', {
        items,
        taxPercent,
        discountAmount,
      });
      return res.data.data;
    } catch {
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = (subtotal * taxPercent) / 100;
      const totalAmount = subtotal + taxAmount - discountAmount;
      return {
        subtotal,
        taxPercent,
        taxAmount,
        discountAmount,
        totalAmount,
      };
    }
  },
};

export default api;
