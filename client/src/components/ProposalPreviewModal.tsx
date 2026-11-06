import React, { useState } from 'react';
import { 
  X, Download, Send, CheckCircle2, RefreshCw, LayoutTemplate, 
  ExternalLink, Mail, ArrowRight, ShieldCheck, FileText 
} from 'lucide-react';
import { Proposal } from '../types';
import { ProposalApi } from '../services/api';

interface ProposalPreviewModalProps {
  proposal: Proposal;
  onClose: () => void;
  onProposalUpdated: (updated: Proposal) => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  proposal,
  onClose,
  onProposalUpdated,
}) => {
  const [activeTemplate, setActiveTemplate] = useState<string>(proposal.templateId);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(proposal.clientEmail);
  const [customEmailMessage, setCustomEmailMessage] = useState(`Dear ${proposal.clientName},

We are pleased to present our formal business proposal (#${proposal.proposalNumber}) for "${proposal.title}". 

We have carefully reviewed your technical specifications and compiled an itemized scope of work, timeline, and investment breakdown.

Please find the detailed proposal document attached as a PDF to this email.

Investment Summary:
• Total Proposed Amount: $${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
• Validity: 30 Days from issuance

If you have any questions or would like to adjust the scope, please feel free to reply directly to this email.

Best regards,
Proposal Engineering Team
${proposal.companyName}`);

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const previewUrl = ProposalApi.getPreviewUrl(proposal.id, activeTemplate);
  const downloadUrl = ProposalApi.getDownloadUrl(proposal.id);

  const handleSendEmail = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      const res = await ProposalApi.sendEmail(proposal.id, {
        recipientEmail,
        customMessage: customEmailMessage,
      });

      if (res.success) {
        setSendSuccess(true);
        onProposalUpdated(res.data);
        setTimeout(() => {
          setShowEmailDialog(false);
          setSendSuccess(false);
        }, 2000);
      } else {
        setSendError('Failed to send email');
      }
    } catch (err: any) {
      setSendError(err.response?.data?.error || err.message || 'Email delivery failed');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    if (proposal.id.startsWith('prop-')) {
      e.preventDefault();
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[95vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-300">#{proposal.proposalNumber}</span>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                  proposal.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {proposal.status}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-md">{proposal.title}</h2>
            </div>
          </div>

          {/* Template Switcher Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold px-2 uppercase hidden md:inline">Template:</span>
            {[
              { id: 'modern-minimalist', name: 'Minimalist' },
              { id: 'corporate-executive', name: 'Executive' },
              { id: 'creative-studio', name: 'Studio' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTemplate === t.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            <a
              href={downloadUrl}
              onClick={handleDownload}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={() => setShowEmailDialog(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Client</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden relative flex flex-col items-center justify-center">
          <iframe
            key={activeTemplate}
            src={previewUrl}
            title="Proposal Live Preview"
            className="w-full h-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-300"
          />
        </div>

        {/* Email Dispatch Modal Dialog */}
        {showEmailDialog && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Send Proposal via SMTP</h3>
                    <p className="text-[11px] text-slate-500">Document will be attached as vector PDF</p>
                  </div>
                </div>
                <button onClick={() => setShowEmailDialog(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sendSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900">Proposal Dispatched Successfully!</h4>
                  <p className="text-xs text-slate-500">
                    Delivered to <strong>{recipientEmail}</strong> with PDF attached. Proposal status marked as SENT.
                  </p>
                </div>
              ) : (
                <>
                  {sendError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                      {sendError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Recipient Client Email</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Accompanying Note</label>
                    <textarea
                      rows={7}
                      value={customEmailMessage}
                      onChange={e => setCustomEmailMessage(e.target.value)}
                      className="w-full text-xs font-sans p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Attachment: <strong>{proposal.proposalNumber}.pdf</strong></span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700">
                      ${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setShowEmailDialog(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={isSending}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Email...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
