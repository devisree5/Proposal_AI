import axios from 'axios';
import { EmailRequest, Proposal, CatalogItem, PricingLineItem } from '../types/index.js';

const API_ORIGIN = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
const BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const EmailApi = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: EmailRequest[] }>('/emails');
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: EmailRequest }>(`/emails/${id}`);
    return res.data.data;
  },

  checkInbox: async () => {
    const res = await api.post<{ success: boolean; data: { fetched: number; processed: number; errors: string[] } }>('/emails/check-inbox');
    return res.data.data;
  },

  simulate: async (scenario?: string, customData?: any) => {
    const res = await api.post<{ success: boolean; data: { email: EmailRequest; extraction: any; suggestedPricing: any } }>('/emails/simulate', {
      scenario,
      customData,
    });
    return res.data.data;
  },

  updateExtraction: async (id: string, payload: any) => {
    const res = await api.put<{ success: boolean; data: any; suggestedPricing: any }>(`/emails/extractions/${id}`, payload);
    return res.data;
  },
};

export const ProposalApi = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: Proposal[] }>('/proposals');
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Proposal }>(`/proposals/${id}`);
    return res.data.data;
  },

  create: async (payload: any) => {
    const res = await api.post<{ success: boolean; data: Proposal }>('/proposals', payload);
    return res.data.data;
  },

  update: async (id: string, payload: any) => {
    const res = await api.put<{ success: boolean; data: Proposal }>(`/proposals/${id}`, payload);
    return res.data.data;
  },

  getPreviewUrl: (id: string, templateId?: string) => {
    return `${BASE_URL}/proposals/${id}/preview${templateId ? `?templateId=${templateId}` : ''}`;
  },

  getDownloadUrl: (id: string) => {
    return `${BASE_URL}/proposals/${id}/download`;
  },

  sendEmail: async (id: string, payload: { recipientEmail?: string; customMessage?: string }) => {
    const res = await api.post<{ success: boolean; message: string; data: Proposal }>(`/proposals/${id}/send`, payload);
    return res.data;
  },
};

export const CatalogApi = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: CatalogItem[] }>('/catalog');
    return res.data.data;
  },

  create: async (payload: any) => {
    const res = await api.post<{ success: boolean; data: CatalogItem }>('/catalog', payload);
    return res.data.data;
  },

  update: async (id: string, payload: any) => {
    const res = await api.put<{ success: boolean; data: CatalogItem }>(`/catalog/${id}`, payload);
    return res.data.data;
  },

  matchPricing: async (scopeItems: string[], deliverables: any[], taxPercent?: number, discountAmount?: number) => {
    const res = await api.post<{ success: boolean; data: any }>('/catalog/match', {
      scopeItems,
      deliverables,
      taxPercent,
      discountAmount,
    });
    return res.data.data;
  },

  calculateTotals: async (items: PricingLineItem[], taxPercent?: number, discountAmount?: number) => {
    const res = await api.post<{ success: boolean; data: any }>('/catalog/calculate', {
      items,
      taxPercent,
      discountAmount,
    });
    return res.data.data;
  },
};

export default api;
