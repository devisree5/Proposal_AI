import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, Sparkles, Plus, Trash2, Edit3, 
  ArrowRight, ShieldCheck, DollarSign, Calendar, Mail, Phone, Building, Layers 
} from 'lucide-react';
import { EmailRequest, PricingLineItem } from '../types';

interface RequirementEditorModalProps {
  email: EmailRequest;
  onClose: () => void;
  onProceedToProposal: (updatedData: any) => void;
  onSaveExtraction: (id: string, updatedData: any) => Promise<any>;
}

export const RequirementEditorModal: React.FC<RequirementEditorModalProps> = ({
  email,
  onClose,
  onProceedToProposal,
  onSaveExtraction,
}) => {
  const extraction = email.extraction;

  // Form states
  const [clientName, setClientName] = useState(extraction?.clientName || email.senderName);
  const [companyName, setCompanyName] = useState(extraction?.companyName || 'Prospective Client');
  const [contactEmail, setContactEmail] = useState(extraction?.contactEmail || email.senderEmail);
  const [contactPhone, setContactPhone] = useState(extraction?.contactPhone || '');
  const [projectName, setProjectName] = useState(extraction?.projectName || email.subject.replace(/^re:\s*/i, ''));
  const [projectDescription, setProjectDescription] = useState(extraction?.projectDescription || '');

  // Scope items
  let initialScope: string[] = [];
  try {
    initialScope = JSON.parse(extraction?.scopeItems || '[]');
  } catch {
    initialScope = [];
  }
  const [scopeItems, setScopeItems] = useState<string[]>(initialScope);
  const [newScopeText, setNewScopeText] = useState('');

  // Deliverables
  let initialDeliverables: Array<{ title: string; description: string; quantity?: string | number }> = [];
  try {
    initialDeliverables = JSON.parse(extraction?.deliverables || '[]');
  } catch {
    initialDeliverables = [];
  }
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [newDelivTitle, setNewDelivTitle] = useState('');
  const [newDelivDesc, setNewDelivDesc] = useState('');
  const [newDelivQty, setNewDelivQty] = useState('1 Complete Unit');

  // Timeline & Budget
  const [expectedTimeline, setExpectedTimeline] = useState(extraction?.expectedTimeline || '4 - 6 Weeks');
  const [budget, setBudget] = useState(extraction?.budget || 'Quote Requested');

  // Missing or unclear items
  let initialMissing: string[] = [];
  try {
    initialMissing = JSON.parse(extraction?.missingOrUnclear || '[]');
  } catch {
    initialMissing = [];
  }
  const [missingOrUnclear, setMissingOrUnclear] = useState<string[]>(initialMissing);

  const [activeTab, setActiveTab] = useState<'extracted' | 'rawEmail'>('extracted');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddScope = () => {
    if (!newScopeText.trim()) return;
    setScopeItems([...scopeItems, newScopeText.trim()]);
    setNewScopeText('');
  };

  const handleRemoveScope = (index: number) => {
    setScopeItems(scopeItems.filter((_, i) => i !== index));
  };

  const handleAddDeliverable = () => {
    if (!newDelivTitle.trim()) return;
    setDeliverables([
      ...deliverables,
      { title: newDelivTitle.trim(), description: newDelivDesc.trim(), quantity: newDelivQty.trim() },
    ]);
    setNewDelivTitle('');
    setNewDelivDesc('');
    setNewDelivQty('1 Complete Unit');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const getPayload = () => ({
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
    isVerified: true,
  });

  const handleSaveOnly = async () => {
    if (!extraction?.id) return;
    setIsSaving(true);
    try {
      await onSaveExtraction(extraction.id, getPayload());
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceed = () => {
    onProceedToProposal(getPayload());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">Review & Correct AI Extracted Requirements</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Email Subject: <span className="font-semibold text-slate-700">"{email.subject}"</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('extracted')}
                className={`px-3 py-1 rounded-md transition ${activeTab === 'extracted' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Extracted Requirements
              </button>
              <button
                onClick={() => setActiveTab('rawEmail')}
                className={`px-3 py-1 rounded-md transition ${activeTab === 'rawEmail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Original Raw Email
              </button>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'rawEmail' ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
                <div className="pb-3 mb-3 border-b border-slate-200 font-sans text-slate-600">
                  <div><strong>From:</strong> {email.senderName} &lt;{email.senderEmail}&gt;</div>
                  <div><strong>Received:</strong> {new Date(email.receivedAt).toLocaleString()}</div>
                  <div><strong>Message ID:</strong> {email.messageId}</div>
                  <div><strong>Subject:</strong> {email.subject}</div>
                </div>
                {email.rawBody}
              </div>
            </div>
          ) : (
            <>
              {/* Missing or Unclear Alerts */}
              {missingOrUnclear.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>AI Flagged: Ambiguities or Missing Information in Customer Request</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                    {missingOrUnclear.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-700 mt-2 font-medium">
                    Tip: You can manually supply or clarify these values in the fields below before generating the proposal.
                  </p>
                </div>
              )}

              {/* Client & Project Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Client Company</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Client Email</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 234-5678"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Project Title & Overview */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project / Proposal Title</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Overview & Objectives</label>
                  <textarea
                    rows={3}
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Required Features & Scope Items ({scopeItems.length})
                </label>
                <div className="space-y-2">
                  {scopeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={e => {
                          const updated = [...scopeItems];
                          updated[idx] = e.target.value;
                          setScopeItems(updated);
                        }}
                        className="flex-1 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 font-medium"
                      />
                      <button
                        onClick={() => handleRemoveScope(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new scope */}
                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    value={newScopeText}
                    onChange={e => setNewScopeText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddScope()}
                    placeholder="Add an additional scope requirement..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    onClick={handleAddScope}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Key Deliverables */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Contractual Deliverables & Quantities ({deliverables.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {deliverables.map((del, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative group">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-slate-900">{del.title}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                          {del.quantity || '1x'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{del.description}</p>
                      <button
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="absolute right-2 bottom-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Deliverable */}
                <div className="bg-slate-50/60 p-3 rounded-lg border border-dashed border-slate-300 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newDelivTitle}
                      onChange={e => setNewDelivTitle(e.target.value)}
                      placeholder="Deliverable title (e.g. REST API)"
                      className="sm:col-span-2 text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={newDelivQty}
                      onChange={e => setNewDelivQty(e.target.value)}
                      placeholder="Qty (e.g. 1 Unit, 8 Screens)"
                      className="text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newDelivDesc}
                      onChange={e => setNewDelivDesc(e.target.value)}
                      placeholder="Deliverable technical description..."
                      className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                    />
                    <button
                      onClick={handleAddDeliverable}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Deliverable</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Commercial Estimates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expected Timeline</span>
                  </label>
                  <input
                    type="text"
                    value={expectedTimeline}
                    onChange={e => setExpectedTimeline(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Client Budget Indication</span>
                  </label>
                  <input
                    type="text"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveOnly}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Save Updates'}
            </button>

            <button
              onClick={handleProceed}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
            >
              <span>Build Proposal & Select Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
