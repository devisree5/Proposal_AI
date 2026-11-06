import React, { useState, useEffect } from 'react';
import { 
  X, Check, Sparkles, Plus, Trash2, ArrowRight, ArrowLeft, 
  DollarSign, Calculator, Layers, FileText, CheckCircle2, AlertTriangle, ShieldAlert 
} from 'lucide-react';
import { CatalogItem, PricingLineItem } from '../types/index.js';
import { CatalogApi, ProposalApi } from '../services/api.js';

interface ProposalBuilderModalProps {
  initialData: any;
  catalog: CatalogItem[];
  onClose: () => void;
  onProposalCreated: (proposal: any) => void;
}

export const ProposalBuilderModal: React.FC<ProposalBuilderModalProps> = ({
  initialData,
  catalog,
  onClose,
  onProposalCreated,
}) => {
  const [step, setStep] = useState<'template' | 'details' | 'pricing' | 'terms'>('template');
  const [templateId, setTemplateId] = useState<'modern-minimalist' | 'corporate-executive' | 'creative-studio'>('modern-minimalist');

  // Provider
  const [companyName, setCompanyName] = useState('PropFlow Solutions Inc.');
  const [companyEmail, setCompanyEmail] = useState('borradevisree20@gmail.com');
  const [companyPhone, setCompanyPhone] = useState('+1 (555) 392-8012');
  const [companyAddress, setCompanyAddress] = useState('450 Market Street, Suite 800, San Francisco, CA');

  // Client
  const [clientName, setClientName] = useState(initialData.clientName || 'Valued Client');
  const [clientCompany, setClientCompany] = useState(initialData.companyName || '');
  const [clientEmail, setClientEmail] = useState(initialData.contactEmail || '');
  const [clientPhone, setClientPhone] = useState(initialData.contactPhone || '');

  // Project
  const [title, setTitle] = useState(initialData.projectName || 'Enterprise Software Engineering Proposal');
  const [overview, setOverview] = useState(initialData.projectDescription || '');
  const [scopeItems, setScopeItems] = useState<string[]>(initialData.scopeItems || []);
  const [deliverables, setDeliverables] = useState<any[]>(initialData.deliverables || []);

  // Pricing Items
  const [pricingItems, setPricingItems] = useState<PricingLineItem[]>([]);
  const [taxPercent, setTaxPercent] = useState<number>(10.0);
  const [discountAmount, setDiscountAmount] = useState<number>(0.0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Timeline & Terms
  const [timelineWeeks, setTimelineWeeks] = useState<number>(initialData.timelineWeeks || 6);
  const [termsAndConditions, setTermsAndConditions] = useState<string>(`
1. Validity: This proposal and commercial pricing are valid for 30 calendar days from the date of issue.
2. Payment Schedule: 40% initial mobilization deposit upon contract execution, 30% upon midpoint milestone demo, and 30% upon final acceptance and deployment.
3. Intellectual Property: Full ownership of all custom software artifacts, source code, and design assets transfers to the Client upon settlement of the final invoice.
4. Scope Changes: Any additions or enhancements requested outside the outlined Scope of Work will be estimated separately under standard hourly rates.
5. Warranty: Provider warrants all software deliverables against critical defects for 60 days following production launch.
  `.trim());

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState('');

  // Initial pricing match from backend
  useEffect(() => {
    async function loadSuggestedPricing() {
      try {
        const result = await CatalogApi.matchPricing(scopeItems, deliverables, taxPercent, discountAmount);
        if (result && result.items) {
          setPricingItems(result.items);
          setSubtotal(result.subtotal);
          setTaxAmount(result.taxAmount);
          setTotalAmount(result.totalAmount);
        }
      } catch (err) {
        console.warn('Error matching initial pricing:', err);
      }
    }
    loadSuggestedPricing();
  }, []);

  // Recalculate totals whenever items, tax, or discount change
  const recalculate = async (items: PricingLineItem[], tax: number, discount: number) => {
    try {
      const res = await CatalogApi.calculateTotals(items, tax, discount);
      setPricingItems(res.items);
      setSubtotal(res.subtotal);
      setTaxAmount(res.taxAmount);
      setTotalAmount(res.totalAmount);
    } catch {
      // Local fallback calculation
      const updated = items.map(i => ({ ...i, total: Number((i.quantity * i.unitRate).toFixed(2)) }));
      const sub = updated.reduce((s, i) => s + i.total, 0);
      const tAmt = (sub * tax) / 100;
      setPricingItems(updated);
      setSubtotal(sub);
      setTaxAmount(tAmt);
      setTotalAmount(Math.max(0, sub + tAmt - discount));
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...pricingItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitRate') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const rate = field === 'unitRate' ? parseFloat(value) || 0 : item.unitRate;
      item.total = Number((qty * rate).toFixed(2));
    }
    updated[index] = item;
    recalculate(updated, taxPercent, discountAmount);
  };

  const handleRemoveItem = (index: number) => {
    const updated = pricingItems.filter((_, i) => i !== index);
    recalculate(updated, taxPercent, discountAmount);
  };

  const handleAddFromCatalog = () => {
    if (!selectedCatalogCode) return;
    const catItem = catalog.find(c => c.code === selectedCatalogCode);
    if (!catItem) return;

    let qty = 40;
    if (catItem.unitType === 'milestone') qty = 1;
    if (catItem.unitType === 'month') qty = 3;

    const newItem: PricingLineItem = {
      catalogItemId: catItem.id,
      code: catItem.code,
      name: catItem.name,
      description: catItem.description,
      unitType: catItem.unitType,
      quantity: qty,
      unitRate: catItem.defaultRate,
      total: qty * catItem.defaultRate,
      isCustom: false,
    };

    recalculate([...pricingItems, newItem], taxPercent, discountAmount);
    setSelectedCatalogCode('');
  };

  const handleAddCustomItem = () => {
    const newItem: PricingLineItem = {
      code: 'CUSTOM-SVC',
      name: 'Custom Service / Deliverable',
      description: 'Custom client requirement estimated according to project specifications.',
      unitType: 'estimate',
      quantity: 1,
      unitRate: 1500,
      total: 1500,
      isCustom: true,
      unmatchedReason: 'Manual quote entry',
    };
    recalculate([...pricingItems, newItem], taxPercent, discountAmount);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const proposal = await ProposalApi.create({
        emailRequestId: initialData.emailRequestId || null,
        templateId,
        title,
        companyName,
        companyEmail,
        companyPhone,
        companyAddress,
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
      });

      onProposalCreated(proposal);
    } catch (err: any) {
      alert(`Error creating proposal: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header with Steps */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <FileText className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">Proposal Builder & Pricing Configurator</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select design template, verify client details, customize catalog pricing, and generate PDF.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
            {[
              { id: 'template', label: '1. Template' },
              { id: 'details', label: '2. Overview' },
              { id: 'pricing', label: '3. Pricing & Scope' },
              { id: 'terms', label: '4. Terms & Finalize' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStep(s.id as any)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  step === s.id
                    ? 'bg-white text-blue-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: TEMPLATE SELECTION */}
          {step === 'template' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Select a Professional PDF Proposal Template (3 Available)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose the aesthetic and layout best suited for your client and industry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Template 1 */}
                <div
                  onClick={() => setTemplateId('modern-minimalist')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    templateId === 'modern-minimalist'
                      ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {templateId === 'modern-minimalist' && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div className="h-28 rounded-lg bg-slate-100 border border-slate-200 mb-4 p-3 flex flex-col justify-between overflow-hidden">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1">
                        <div className="w-16 h-2 bg-slate-900 rounded" />
                        <div className="w-8 h-2 bg-blue-600 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-slate-300 rounded" />
                        <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-4 bg-slate-200 rounded" />
                        <div className="h-4 bg-slate-200 rounded" />
                        <div className="h-4 bg-slate-900 rounded" />
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Modern Minimalist</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Sleek sans-serif typography, clean borders, high whitespace. Best for modern tech startups, web & SaaS agencies.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-blue-600">
                    Active Choice: Clean & Crisp
                  </div>
                </div>

                {/* Template 2 */}
                <div
                  onClick={() => setTemplateId('corporate-executive')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    templateId === 'corporate-executive'
                      ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {templateId === 'corporate-executive' && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div className="h-28 rounded-lg bg-gradient-to-r from-slate-900 to-blue-900 mb-4 p-3 flex flex-col justify-between text-white overflow-hidden shadow-inner">
                      <div className="flex justify-between items-center">
                        <div className="w-14 h-2 bg-blue-300 rounded" />
                        <div className="w-10 h-2 bg-white/40 rounded" />
                      </div>
                      <div className="space-y-1 bg-white/10 p-2 rounded">
                        <div className="w-full h-1.5 bg-white/60 rounded" />
                        <div className="w-2/3 h-1.5 bg-white/40 rounded" />
                      </div>
                      <div className="w-16 h-2 bg-blue-400 rounded" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Corporate Executive</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Formal deep navy top banner, classic serif headings, executive callout boxes. Best for enterprise consulting & RFP tenders.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-indigo-700">
                    Active Choice: Formal & Authoritative
                  </div>
                </div>

                {/* Template 3 */}
                <div
                  onClick={() => setTemplateId('creative-studio')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    templateId === 'creative-studio'
                      ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {templateId === 'creative-studio' && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div className="h-28 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 mb-4 p-3 flex flex-col justify-between text-white overflow-hidden shadow-inner">
                      <div className="flex justify-between items-center">
                        <div className="w-16 h-2 bg-white rounded" />
                        <div className="w-8 h-2 bg-white/50 rounded-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="h-4 bg-white/20 rounded" />
                        <div className="h-4 bg-white/20 rounded" />
                      </div>
                      <div className="w-12 h-2 bg-pink-200 rounded" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Creative Studio</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Vibrant gradient header, card-based layout, milestone pill badges. Best for design agencies, mobile developers, & studios.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-purple-700">
                    Active Choice: Vibrant & Modern
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep('details')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
                >
                  <span>Continue to Overview & Metadata</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: METADATA & OVERVIEW */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provider Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Provider Company Details</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Official Email</label>
                    <input
                      type="text"
                      value={companyEmail}
                      onChange={e => setCompanyEmail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Phone</label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={e => setCompanyPhone(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Address</label>
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={e => setCompanyAddress(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Client Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Client Partner Details</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Client Company</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={e => setClientCompany(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Primary Contact</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Client Email (Proposal Destination)</label>
                    <input
                      type="text"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Client Phone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Overview */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Proposal Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Executive Summary</label>
                  <textarea
                    rows={4}
                    value={overview}
                    onChange={e => setOverview(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep('template')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('pricing')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
                >
                  <span>Continue to Pricing Automation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PRICING AUTOMATION & CATALOG MATCHING */}
          {step === 'pricing' && (
            <div className="space-y-6">
              {/* Safeguard Alert */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold">Catalog-Driven Deterministic Pricing: </span>
                  Every dollar in this table is computed from your verified service catalog. 
                  Unmatched requirements are flagged for manual pricing adjustments. AI never invents rates.
                </div>
              </div>

              {/* Add from Catalog Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center justify-between">
                <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
                  <select
                    value={selectedCatalogCode}
                    onChange={e => setSelectedCatalogCode(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 flex-1 sm:max-w-md font-medium"
                  >
                    <option value="">-- Add an existing service from Catalog --</option>
                    {catalog.map(cat => (
                      <option key={cat.code} value={cat.code}>
                        [{cat.code}] {cat.name} (${cat.defaultRate}/{cat.unitType})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddFromCatalog}
                    disabled={!selectedCatalogCode}
                    className="px-3 py-1.5 bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                </div>

                <button
                  onClick={handleAddCustomItem}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Scope Quote</span>
                </button>
              </div>

              {/* Pricing Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="p-3 w-5/12">Service Line / Scope Requirement</th>
                      <th className="p-3 w-2/12">Unit Type</th>
                      <th className="p-3 w-1/12 text-right">Qty</th>
                      <th className="p-3 w-2/12 text-right">Unit Rate ($)</th>
                      <th className="p-3 w-2/12 text-right">Total ($)</th>
                      <th className="p-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pricingItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No items added yet. Select a service from the catalog above.
                        </td>
                      </tr>
                    ) : (
                      pricingItems.map((item, idx) => (
                        <tr key={idx} className={item.isCustom ? 'bg-amber-50/40' : ''}>
                          <td className="p-3">
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                value={item.name}
                                onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                                className="font-bold text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-0 w-full"
                              />
                              {item.isCustom && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded shrink-0">
                                  CUSTOM
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={item.description}
                              onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                              className="text-[11px] text-slate-500 bg-transparent border-0 focus:outline-none focus:ring-0 w-full mt-0.5"
                            />
                            {item.unmatchedReason && (
                              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                ⚠ {item.unmatchedReason}
                              </p>
                            )}
                          </td>

                          <td className="p-3">
                            <input
                              type="text"
                              value={item.unitType}
                              onChange={e => handleUpdateItem(idx, 'unitType', e.target.value)}
                              className="w-20 text-xs px-2 py-1 rounded border border-slate-200"
                            />
                          </td>

                          <td className="p-3 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleUpdateItem(idx, 'quantity', e.target.value)}
                              className="w-16 text-right text-xs px-2 py-1 rounded border border-slate-200 font-bold"
                            />
                          </td>

                          <td className="p-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitRate}
                              onChange={e => handleUpdateItem(idx, 'unitRate', e.target.value)}
                              className="w-24 text-right text-xs px-2 py-1 rounded border border-slate-200 font-bold"
                            />
                          </td>

                          <td className="p-3 text-right font-extrabold text-slate-900">
                            ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-red-500 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Calculation Area */}
              <div className="flex justify-end">
                <div className="w-80 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center space-x-1">
                      <span>Discount ($)</span>
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setDiscountAmount(val);
                        recalculate(pricingItems, taxPercent, val);
                      }}
                      className="w-20 text-right px-2 py-1 rounded border border-slate-200 bg-white text-emerald-600 font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tax Rate (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setTaxPercent(val);
                        recalculate(pricingItems, val, discountAmount);
                      }}
                      className="w-20 text-right px-2 py-1 rounded border border-slate-200 bg-white font-bold"
                    />
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax ({taxPercent}%)</span>
                    <span>${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-extrabold text-sm text-slate-900">
                    <span>Total Investment</span>
                    <span className="text-blue-700">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep('details')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('terms')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
                >
                  <span>Continue to Terms & Finalize</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TIMELINE, TERMS & FINALIZE */}
          {step === 'terms' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estimated Delivery Timeline (Weeks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={timelineWeeks}
                  onChange={e => setTimelineWeeks(parseInt(e.target.value, 10) || 6)}
                  className="w-40 text-xs px-3 py-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Commercial Terms & Acceptance Conditions
                </label>
                <textarea
                  rows={8}
                  value={termsAndConditions}
                  onChange={e => setTermsAndConditions(e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed"
                />
              </div>

              {/* Summary of What Will Be Generated */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-xs text-slate-900 uppercase mb-2">Proposal Generation Summary</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SELECTED TEMPLATE</span>
                    <span className="font-bold text-slate-800 capitalize">{templateId.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CLIENT</span>
                    <span className="font-bold text-slate-800">{clientCompany || clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LINE ITEMS</span>
                    <span className="font-bold text-slate-800">{pricingItems.length} Services</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOTAL VALUE</span>
                    <span className="font-bold text-blue-700">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep('pricing')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back to Pricing
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/30 flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <span>Rendering Vector PDF...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Proposal & Launch Live Preview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
