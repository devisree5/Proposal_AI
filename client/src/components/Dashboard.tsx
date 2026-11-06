import React from 'react';
import { 
  Inbox, FileCheck, Send, DollarSign, Sparkles, ArrowRight, 
  RefreshCw, CheckCircle, Clock, AlertTriangle, ShieldCheck, FileText 
} from 'lucide-react';
import { EmailRequest, Proposal } from '../types';

interface DashboardProps {
  emails: EmailRequest[];
  proposals: Proposal[];
  onOpenSimulator: () => void;
  onSyncInbox: () => void;
  isSyncing: boolean;
  onViewEmail: (email: EmailRequest) => void;
  onViewProposal: (proposal: Proposal) => void;
  setActiveTab: (tab: 'dashboard' | 'emails' | 'proposals' | 'catalog') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  emails,
  proposals,
  onOpenSimulator,
  onSyncInbox,
  isSyncing,
  onViewEmail,
  onViewProposal,
  setActiveTab,
}) => {
  const totalEmails = emails.length;
  const pendingReview = emails.filter(e => e.status === 'EXTRACTED').length;
  const totalProposals = proposals.length;
  const totalValue = proposals.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const sentProposals = proposals.filter(p => p.status === 'SENT').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Driven Sales Proposal Automation</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Turn Inbound Inquiries Into Polished Proposals in Seconds
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-2xl">
            PropFlow AI captures customer RFP emails, extracts structured requirements using Gemini AI, 
            deterministically calculates costs via your pricing catalog, and outputs multi-template PDF proposals ready for instant delivery.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Customer Inbound Email</span>
            </button>
            <button
              onClick={onSyncInbox}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs transition"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isSyncing ? 'Checking Gmail...' : 'Check Live IMAP'}</span>
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className="inline-flex items-center space-x-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-semibold text-xs transition border border-slate-700/60"
            >
              <span>View All Proposals ({proposals.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inbound Inquiries</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalEmails}</p>
            <p className="text-[11px] text-slate-500 mt-1">Processed from Gmail / IMAP</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Extracted / Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingReview}</p>
            <p className="text-[11px] text-slate-500 mt-1">Ready for proposal generation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Generated Proposals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Generated Proposals</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{totalProposals}</p>
            <p className="text-[11px] text-slate-500 mt-1">{sentProposals} delivered via SMTP</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline Value</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Across generated quotes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* System Workflow Status Callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-blue-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Automated B2B Sales Workflow (5-Step Lifecycle)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-900 mb-1">1. Inbound Ingestion</div>
            <p className="text-slate-600">Captures customer emails via Gmail IMAP or simulator with deduplication.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-900 mb-1">2. AI Extraction</div>
            <p className="text-slate-600">Gemini parses client info, scope, deliverables, timeline, budget, and missing items.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-900 mb-1">3. Pricing Matcher</div>
            <p className="text-slate-600">Deterministic catalog matching calculates rates. Unmatched scope is flagged.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-900 mb-1">4. 3-Template PDF</div>
            <p className="text-slate-600">Choose Minimalist, Executive, or Studio style. Full dynamic preview.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-900 mb-1">5. Outbound Delivery</div>
            <p className="text-slate-600">Dispatch proposal with vector PDF attachment directly to client's email via SMTP.</p>
          </div>
        </div>
      </div>

      {/* Dual Tables: Recent Inquiries & Recent Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Inbox className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-800 text-sm">Recent Inbound Inquiries</h2>
            </div>
            <button
              onClick={() => setActiveTab('emails')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No customer inquiries received yet. Click "Simulate Inbound RFP" above to test immediately!
              </div>
            ) : (
              emails.slice(0, 5).map(email => (
                <div
                  key={email.id}
                  onClick={() => onViewEmail(email)}
                  className="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-900 truncate">{email.subject}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      From: <span className="font-medium text-slate-700">{email.senderName}</span> ({email.senderEmail})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      email.status === 'PROPOSAL_GENERATED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : email.status === 'EXTRACTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {email.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-800 text-sm">Generated Proposals</h2>
            </div>
            <button
              onClick={() => setActiveTab('proposals')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {proposals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No proposals generated yet. Open any extracted email inquiry to build your first proposal.
              </div>
            ) : (
              proposals.slice(0, 5).map(proposal => (
                <div
                  key={proposal.id}
                  onClick={() => onViewProposal(proposal)}
                  className="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-slate-600">{proposal.proposalNumber}</span>
                      <span className="text-xs font-bold text-slate-900 truncate">{proposal.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Client: <span className="font-medium text-slate-700">{proposal.clientName}</span> | Template: <span className="capitalize">{proposal.templateId.replace('-', ' ')}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900">
                      ${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full mt-0.5 ${
                      proposal.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
