import React, { useState } from 'react';
import { X, Sparkles, Send, Smartphone, ShoppingBag, BrainCircuit, PenTool, CheckCircle2 } from 'lucide-react';
import { EmailApi } from '../services/api';

interface EmailSimulatorModalProps {
  onClose: () => void;
  onSimulationSuccess: (data: any) => void;
}

export const EmailSimulatorModal: React.FC<EmailSimulatorModalProps> = ({
  onClose,
  onSimulationSuccess,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('mobile_app');
  const [isCustom, setIsCustom] = useState(false);
  const [senderName, setSenderName] = useState('Sarah Jenkins');
  const [senderEmail, setSenderEmail] = useState('sarah.jenkins@healthsync.io');
  const [subject, setSubject] = useState('RFP: HIPAA-Compliant Telehealth Mobile App (iOS & Android)');
  const [body, setBody] = useState(`Hi Team,

I am the Head of Product at HealthSync Technologies. We are looking for an experienced engineering partner to develop a cross-platform mobile application (iOS & Android) for our patient-doctor consultation platform.

Key Requirements:
1. Video consultation module with WebRTC
2. Appointment scheduling and Google Calendar sync
3. Secure patient profile and encrypted medical record upload
4. Stripe payment gateway integration for consultation fees
5. HIPAA compliance audit and high-availability cloud infrastructure on AWS

Our expected launch is in 8 weeks, with a target budget of around $25,000 to $35,000.
We need a full breakdown of milestones, deliverables, and engineering hours.

Looking forward to your proposal!

Best regards,
Sarah Jenkins
Head of Product, HealthSync Inc.
Phone: +1 (415) 890-2341`);

  const [isLoading, setIsLoading] = useState(false);

  const handleScenarioChange = (key: string) => {
    setSelectedScenario(key);
    setIsCustom(false);
    if (key === 'mobile_app') {
      setSenderName('Sarah Jenkins');
      setSenderEmail('sarah.jenkins@healthsync.io');
      setSubject('RFP: HIPAA-Compliant Telehealth Mobile App (iOS & Android)');
      setBody(`Hi Team,

I am the Head of Product at HealthSync Technologies. We are looking for an experienced engineering partner to develop a cross-platform mobile application (iOS & Android) for our patient-doctor consultation platform.

Key Requirements:
1. Video consultation module with WebRTC
2. Appointment scheduling and Google Calendar sync
3. Secure patient profile and encrypted medical record upload
4. Stripe payment gateway integration for consultation fees
5. HIPAA compliance audit and high-availability cloud infrastructure on AWS

Our expected launch is in 8 weeks, with a target budget of around $25,000 to $35,000.
We need a full breakdown of milestones, deliverables, and engineering hours.

Looking forward to your proposal!

Best regards,
Sarah Jenkins
Head of Product, HealthSync Inc.
Phone: +1 (415) 890-2341`);
    } else if (key === 'ecommerce_redesign') {
      setSenderName('Marcus Vance');
      setSenderEmail('marcus@vanceapparel.com');
      setSubject('Inquiry: Modern E-Commerce Platform Replatforming & UI/UX Design');
      setBody(`Hello,

We run Vance Luxury Apparel and currently operate on an outdated WooCommerce store. We need to replatform our store to a modern, headless Next.js frontend with Shopify or custom Node.js backend.

Scope of work required:
- Complete UI/UX redesign in Figma (desktop & mobile)
- High performance storefront with sub-second page loads
- Product filtering, faceted search, and cart drawer
- Integration with Klaviyo email marketing and Inventory ERP
- Automated CI/CD deployment pipeline with 99.9% uptime SLA

We are aiming to kick off next month and want to launch before Q4 holiday traffic.

Please send over your commercial proposal and portfolio references.

Marcus Vance
CEO, Vance Apparel Ltd.`);
    } else if (key === 'cloud_saas') {
      setSenderName('Elena Rostova');
      setSenderEmail('elena@novadata.ai');
      setSubject('Proposal Request: B2B Enterprise SaaS Architecture & AI Integration');
      setBody(`Dear Sales Engineering,

NovaData is building an enterprise document intelligence copilot. We require a specialized backend and DevOps engineering team to assist in building out our core infrastructure.

Needed Capabilities:
- Scalable microservices backend in Node.js/Python
- Vector database integration (Pinecone/pgvector) for document RAG
- LLM prompt engineering and API pipeline
- Kubernetes cluster configuration and automated security scanning
- Ongoing monthly support and SLA maintenance retainer

We have a budget pre-approved up to $45,000 and would like to review a detailed technical proposal with deliverable timelines.

Thanks,
Elena Rostova
CTO, NovaData AI`);
    }
  };

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const res = await EmailApi.simulate(
        isCustom ? undefined : selectedScenario,
        isCustom ? { senderName, senderEmail, subject, body } : undefined
      );
      onSimulationSuccess(res);
      onClose();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Simulate Customer Inbound Inquiry</h2>
              <p className="text-[11px] text-slate-500">
                Trigger real-time email ingestion, Gemini requirement extraction, and pricing matching.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase">
            Choose a Sample Customer RFP Scenario:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleScenarioChange('mobile_app')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedScenario === 'mobile_app' && !isCustom
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Smartphone className="w-5 h-5 text-blue-600 mb-2" />
              <div>
                <p className="text-xs font-bold text-slate-900">HealthSync App</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Telehealth mobile app RFP</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleScenarioChange('ecommerce_redesign')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedScenario === 'ecommerce_redesign' && !isCustom
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-indigo-600 mb-2" />
              <div>
                <p className="text-xs font-bold text-slate-900">Vance Apparel</p>
                <p className="text-[10px] text-slate-500 mt-0.5">E-Commerce & UI/UX redesign</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleScenarioChange('cloud_saas')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedScenario === 'cloud_saas' && !isCustom
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <BrainCircuit className="w-5 h-5 text-purple-600 mb-2" />
              <div>
                <p className="text-xs font-bold text-slate-900">NovaData AI</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Enterprise SaaS & RAG pipeline</p>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isCustom ? 'Switch to Preset Scenario' : 'Write Custom Client Email'}</span>
            </button>
          </div>

          {/* Form details */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sender Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => { setSenderName(e.target.value); setIsCustom(true); }}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sender Email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={e => { setSenderEmail(e.target.value); setIsCustom(true); }}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => { setSubject(e.target.value); setIsCustom(true); }}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Body Content</label>
              <textarea
                rows={6}
                value={body}
                onChange={e => { setBody(e.target.value); setIsCustom(true); }}
                className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 leading-relaxed text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSimulate}
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
          >
            {isLoading ? (
              <span>Running Ingestion & AI Extraction...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulate Inbound RFP Now</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
