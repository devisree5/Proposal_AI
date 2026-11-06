import React, { useState } from 'react';
import { FileText, Search, Download, Send, Eye, Clock, CheckCircle2, Building, DollarSign } from 'lucide-react';
import { Proposal } from '../types/index.js';
import { ProposalApi } from '../services/api.js';

interface ProposalListProps {
  proposals: Proposal[];
  onViewProposal: (proposal: Proposal) => void;
  onSendProposal: (proposal: Proposal) => void;
}

export const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  onViewProposal,
  onSendProposal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = proposals.filter(p => {
    const matchesSearch =
      p.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientCompany && p.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Proposals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, preview, download, or email generated proposals with live audit trail.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by proposal #, title, or client..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'GENERATED', 'SENT', 'DRAFT'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All Proposals' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Proposal Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-3 w-2/12">Proposal Ref</th>
              <th className="p-3 w-4/12">Project Title & Client</th>
              <th className="p-3 w-2/12">Template Style</th>
              <th className="p-3 w-2/12 text-right">Value ($)</th>
              <th className="p-3 w-1/12 text-center">Status</th>
              <th className="p-3 w-2/12 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No Proposals Found</p>
                  <p className="text-[11px] mt-0.5">Generate a proposal from an inbound inquiry in the Inbound Emails tab.</p>
                </td>
              </tr>
            ) : (
              filtered.map(proposal => (
                <tr key={proposal.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-700">
                    {proposal.proposalNumber}
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-900 truncate max-w-xs">{proposal.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {proposal.clientCompany ? <strong>{proposal.clientCompany} • </strong> : null}
                      {proposal.clientName} ({proposal.clientEmail})
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {proposal.templateId.replace('-', ' ')}
                    </span>
                  </td>

                  <td className="p-3 text-right font-extrabold text-slate-900">
                    ${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      proposal.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {proposal.status}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onViewProposal(proposal)}
                        title="Interactive Preview"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={ProposalApi.getDownloadUrl(proposal.id)}
                        target="_blank"
                        rel="noreferrer"
                        title="Download Vector PDF"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => onViewProposal(proposal)}
                        title="Send via Email"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
