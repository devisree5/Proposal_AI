import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { EmailList } from './components/EmailList';
import { ProposalList } from './components/ProposalList';
import { CatalogManager } from './components/CatalogManagerModal';
import { RequirementEditorModal } from './components/RequirementEditorModal';
import { ProposalBuilderModal } from './components/ProposalBuilderModal';
import { ProposalPreviewModal } from './components/ProposalPreviewModal';
import { EmailSimulatorModal } from './components/EmailSimulatorModal';
import { EmailApi, ProposalApi, CatalogApi } from './services/api';
import { EmailRequest, Proposal, CatalogItem } from './types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'emails' | 'proposals' | 'catalog'>('dashboard');

  const [emails, setEmails] = useState<EmailRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  // Modals state
  const [selectedEmail, setSelectedEmail] = useState<EmailRequest | null>(null);
  const [builderData, setBuilderData] = useState<any | null>(null);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [eData, pData, cData] = await Promise.all([
        EmailApi.getAll().catch(() => []),
        ProposalApi.getAll().catch(() => []),
        CatalogApi.getAll().catch(() => []),
      ]);
      setEmails(eData);
      setProposals(pData);
      setCatalog(cData);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSyncInbox = async () => {
    setIsSyncing(true);
    try {
      const res = await EmailApi.checkInbox();
      showToast(`Checked Gmail IMAP: ${res.fetched} fetched, ${res.processed} service inquiries processed.`, 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(`IMAP sync error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveExtraction = async (id: string, updated: any) => {
    try {
      await EmailApi.updateExtraction(id, updated);
      showToast('Requirements verified and updated successfully.', 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(`Failed to update extraction: ${err.message}`, 'error');
    }
  };

  const handleProceedToProposal = (updatedData: any) => {
    setBuilderData({
      ...updatedData,
      emailRequestId: selectedEmail?.id,
    });
    setSelectedEmail(null);
  };

  const handleProposalCreated = (proposal: Proposal) => {
    setBuilderData(null);
    setPreviewProposal(proposal);
    loadAllData();
    showToast(`Proposal #${proposal.proposalNumber} created successfully!`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulator={() => setShowSimulator(true)}
        onSyncInbox={handleSyncInbox}
        isSyncing={isSyncing}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center space-x-2 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            emails={emails}
            proposals={proposals}
            onOpenSimulator={() => setShowSimulator(true)}
            onSyncInbox={handleSyncInbox}
            isSyncing={isSyncing}
            onViewEmail={e => setSelectedEmail(e)}
            onViewProposal={p => setPreviewProposal(p)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'emails' && (
          <EmailList
            emails={emails}
            onSelectEmail={e => setSelectedEmail(e)}
            onOpenSimulator={() => setShowSimulator(true)}
            onSyncInbox={handleSyncInbox}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'proposals' && (
          <ProposalList
            proposals={proposals}
            onViewProposal={p => setPreviewProposal(p)}
            onSendProposal={p => setPreviewProposal(p)}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogManager
            catalog={catalog}
            onRefreshCatalog={loadAllData}
          />
        )}
      </main>

      {/* Modals */}
      {selectedEmail && (
        <RequirementEditorModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onProceedToProposal={handleProceedToProposal}
          onSaveExtraction={handleSaveExtraction}
        />
      )}

      {builderData && (
        <ProposalBuilderModal
          initialData={builderData}
          catalog={catalog}
          onClose={() => setBuilderData(null)}
          onProposalCreated={handleProposalCreated}
        />
      )}

      {previewProposal && (
        <ProposalPreviewModal
          proposal={previewProposal}
          onClose={() => setPreviewProposal(null)}
          onProposalUpdated={updated => {
            setPreviewProposal(updated);
            loadAllData();
          }}
        />
      )}

      {showSimulator && (
        <EmailSimulatorModal
          onClose={() => setShowSimulator(false)}
          onSimulationSuccess={data => {
            loadAllData();
            showToast('Customer inquiry simulated and processed with Gemini AI!', 'success');
            if (data.email) {
              setSelectedEmail(data.email);
            }
          }}
        />
      )}
    </div>
  );
}
export default App;
