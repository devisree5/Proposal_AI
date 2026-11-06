import React, { useState } from 'react';
import { Mail, Search, Clock, CheckCircle2, ChevronRight, PlusCircle, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { EmailRequest } from '../types/index.js';

interface EmailListProps {
  emails: EmailRequest[];
  onSelectEmail: (email: EmailRequest) => void;
  onOpenSimulator: () => void;
  onSyncInbox: () => void;
  isSyncing: boolean;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  onSelectEmail,
  onOpenSimulator,
  onSyncInbox,
  isSyncing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = emails.filter(email => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inbound Customer Inquiries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Incoming customer RFPs received via Gmail IMAP or simulated test requests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSyncInbox}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>{isSyncing ? 'Checking...' : 'Check Gmail IMAP'}</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate Customer RFP</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by subject, sender, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'EXTRACTED', 'PROPOSAL_GENERATED', 'PENDING'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All Inquiries' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inbound Emails List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Inbound Inquiries Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {emails.length === 0
                ? 'Your inbox is currently empty. Use the "Simulate Customer RFP" button to generate sample inquiries for testing.'
                : 'No inquiries match your current search or status filter.'}
            </p>
          </div>
        ) : (
          filtered.map(email => {
            const hasExtraction = Boolean(email.extraction);
            const proposal = email.proposals && email.proposals[0];

            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className="p-5 hover:bg-slate-50/80 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      email.status === 'PROPOSAL_GENERATED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : email.status === 'EXTRACTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {email.status.replace('_', ' ')}
                    </span>
                    {hasExtraction && (
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-200">
                        AI Extracted
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {new Date(email.receivedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 truncate">{email.subject}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    From: <strong className="text-slate-700">{email.senderName}</strong> &lt;{email.senderEmail}&gt;
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[11px]">
                    {email.rawBody.substring(0, 180)}...
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {proposal ? (
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-700">Proposal #{proposal.proposalNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        ${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectEmail(email);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <span>Review & Generate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
