import React from 'react';
import { FileText, Mail, RefreshCw, PlusCircle, Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'emails' | 'proposals' | 'catalog';
  setActiveTab: (tab: 'dashboard' | 'emails' | 'proposals' | 'catalog') => void;
  onOpenSimulator: () => void;
  onSyncInbox: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulator,
  onSyncInbox,
  isSyncing,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                PropFlow AI
              </span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                B2B SALES AUTO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Email-to-Proposal Generation System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'emails'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inbound Emails</span>
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'proposals'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Proposals</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Pricing Catalog</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onSyncInbox}
            disabled={isSyncing}
            title="Check Gmail IMAP for new customer inquiries"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync IMAP'}</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate Inbound RFP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
