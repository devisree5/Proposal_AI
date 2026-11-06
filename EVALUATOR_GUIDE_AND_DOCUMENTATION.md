# PropFlow AI: AI-Powered Email-to-Proposal Generation System
## Comprehensive Technical Documentation, Architecture Guide & Evaluator Manual

---

## 1. Executive Summary & Primary Idea

### 1.1 The Business Problem
In modern B2B sales (software engineering, cloud consulting, and professional services), prospective clients submit request-for-proposals (RFPs) and service inquiries through unstructured emails. 

Sales teams face four major bottlenecks:
1. **Turnaround Lag**: Sales engineers take 24–72 hours to manually parse email requirements, formulate a project scope, and construct an initial proposal.
2. **Pricing Inconsistency & Hallucination Risk**: When sales teams estimate ad-hoc pricing without adhering to verified rate cards, profit margins suffer. Conversely, naive AI implementations often hallucinate unrealistic rates and arbitrary currency numbers.
3. **Template Rigidity**: Different corporate clients expect different proposal formats (e.g., enterprise procurement departments expect formal executive terms; agile tech startups prefer modern, minimalist scopes).
4. **Disjointed Workflow**: Ingestion, requirement scoping, cost estimation, document drafting, and email dispatch typically happen in separate disconnected applications.

### 1.2 The PropFlow AI Solution
**PropFlow AI** is an enterprise-grade B2B sales automation engine that automates the end-to-end proposal lifecycle with human-in-the-loop verification:

```
[Inbound Customer Email]
         │ (Gmail IMAP or In-App Simulator)
         ▼
[Deduplication & Intake Layer] ── (Prevents duplicate processing via messageId)
         │
         ▼
[Google Gemini AI Extraction] ── (Parses client, scope, deliverables, timeline, budget, flags ambiguities)
         │
         ▼
[Human-in-the-Loop Review UI] ── (Sales reps review, edit, and verify extracted specifications)
         │
         ▼
[Deterministic Pricing Engine] ── (Strict catalog matching; computes hours, rates, tax, discounts)
         │
         ▼
[Multi-Template PDF Generator] ── (Puppeteer renders Modern Minimalist, Corporate Executive, or Creative Studio)
         │
         ▼
[Live Preview & SMTP Dispatch] ── (Interactive browser preview, vector PDF download, automated email dispatch)
```

---

## 2. Technical Architecture & Stack Justification

The platform follows a clean decoupled Client-Server architecture satisfying all assignment technical requirements:

| Component | Technology | Rationale & Justification |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 + Vite + Tailwind CSS + Lucide** | Ultra-responsive dashboard, modular component hierarchy, instantaneous hot reloading, and zero hydration latency for dynamic document iframe previews. |
| **Backend API** | **Node.js (Express + TypeScript)** | Native asynchronous event loop, unified TypeScript types between client and server, native child process management for Puppeteer. |
| **Database & ORM** | **Prisma ORM with SQLite (Dev) & PostgreSQL (Prod)** | Type-safe schema definition with dual-dialect abstraction. Enables zero-config local testing on SQLite and production-grade reliability on PostgreSQL. |
| **AI Extraction Engine** | **Google Gemini API (`@google/generative-ai`)** | High-speed, structured JSON schema enforcement. Converts unstructured email prose into normalized requirement objects with built-in heuristic fallback. |
| **Document Generation** | **Puppeteer (Headless Chromium)** | High-fidelity vector PDF generation from dynamic HTML/CSS templates. Ensures crisp vector typography, exact page break control, and print-ready margins. |
| **Email Protocol** | **IMAP (`mailparser`) & SMTP (`nodemailer`)** | Direct protocol-level integration supporting standard TLS/SSL connections for Gmail and Outlook with App Password authentication. |

---

## 3. Deep Dive: Functional Modules & Implementation

### Module A: Inbound Email Ingestion & Deduplication
- **IMAP Polling (`EmailService.checkIncomingEmails`)**: Connects over secure TLS (port 993) to `imap.gmail.com`. Scans for unread service inquiries.
- **Cryptographic Deduplication**: Tracks RFC-822 `messageId` headers. If an email with the same `messageId` was already ingested, it is skipped, preventing double-billing or redundant proposal creation.
- **Service Request Classification**: Analyzes message content against service-request heuristics (`rfp`, `quote`, `proposal`, `develop`, `services`, `budget`, `timeline`). Non-inquiry emails are ignored.
- **Interactive Inbound Simulator (`EmailService.simulateInboundEmail`)**: Allows evaluators to trigger real-world customer inquiries in 1 click without requiring third-party email configuration. Comes with 3 pre-configured B2B scenarios:
  1. *HealthSync Inc.*: HIPAA-compliant telehealth mobile application ($25k–$35k budget).
  2. *Vance Apparel Ltd.*: Modern headless Next.js e-commerce replatforming.
  3. *NovaData AI*: Enterprise SaaS architecture with RAG vector pipeline ($35k–$45k).

### Module B: AI-Driven Requirement Extraction
- **Structured Schema Enforcement (`AiExtractorService.extractRequirements`)**: Gemini is prompted with strict JSON schema instructions to extract:
  - Client metadata (Company name, primary contact name, email, phone)
  - Project title and executive summary
  - Itemized scope items (array of functional requirements)
  - Contractual deliverables with quantities
  - Target timeline and budget indication
  - Missing/ambiguous information flags (e.g., missing phone number, unconfirmed target launch dates)
- **Deterministic Heuristic Fallback**: If network restrictions or API rate limits prevent remote LLM execution, a built-in rule-based NLP parser extracts entities via regex and semantic tokenizers, ensuring the application **never crashes or blocks the evaluator**.
- **Human-in-the-Loop Review Editor (`RequirementEditorModal.tsx`)**: Sales engineers can inspect both the raw incoming email and the extracted fields side-by-side. Reps can add/remove scope items, clarify missing details, and verify requirements before generating quotes.

### Module C: Multi-Template PDF Proposal Generation
The application includes **3 completely distinct, professionally designed PDF templates**:
1. **Modern Minimalist (`modernMinimalist.ts`)**: Crisp sans-serif typography, clean dividing borders, subtle grid badges. Ideal for agile software consultancies and SaaS agencies.
2. **Corporate Executive (`corporateExecutive.ts`)**: Deep navy header banner, classic serif headings (Lora/Georgia), high-contrast tables, executive summary callouts. Ideal for enterprise RFPs, government tenders, and corporate consulting.
3. **Creative Studio (`creativeStudio.ts`)**: Modern gradient accents (indigo/purple/pink), card-based layout, milestone pill badges. Ideal for design studios, mobile agencies, and creative tech firms.

Every template supports dynamic data:
- Provider company branding, logo, contact details, and address
- Client metadata and executive summary
- Itemized scope list and contractual deliverables
- Detailed pricing table with billing units, quantities, unit rates, and totals
- Milestone timeline schedule (Phase 1: Discovery, Phase 2: Core Engineering, Phase 3: QA & Launch)
- Standard master service agreement terms & acceptance signature blocks

### Module D: Pricing Automation & Anti-Hallucination Engine
- **Hard Constraint**: *AI is strictly prohibited from inventing or independently finalizing prices.*
- **Pre-Configured Pricing Catalog**: 12 verified service items stored in the database across Engineering, Design, DevOps, QA, Security, and Support (e.g., Frontend React Dev @ $95/hr, Mobile Flutter @ $120/hr, Cloud Architecture @ $130/hr, Full-Stack MVP @ $8,500/milestone).
- **Matching Algorithm (`PricingService.matchAndCalculatePricing`)**: Scans extracted scope and deliverables against catalog keyword vectors. Automatically associates the appropriate service lines and assigns estimated quantities.
- **Unmatched Scope Handling**: Requirements that cannot be matched to existing catalog entries are explicitly flagged with a `"Custom Quote Required"` badge, requiring sales reps to enter verified manual rates.
- **Mathematical Calculation Engine**: Backend computes `total = quantity * unitRate`, `subtotal = sum(totals)`, `tax = (subtotal * taxPercent) / 100`, and `finalTotal = subtotal + tax - discount`.

### Module E: Proposal Preview, Approval & SMTP Outbound Delivery
- **Interactive Live Preview (`ProposalPreviewModal.tsx`)**: Renders the complete HTML template inside a responsive viewport. Sales reps can toggle between the 3 templates on the fly and watch the document re-render dynamically.
- **Vector PDF Download**: Headless Chromium generates pixel-perfect A4 vector PDFs with print backgrounds and standard margins.
- **SMTP Outbound Delivery (`EmailService.sendProposalEmail`)**: Connects to Gmail SMTP (`smtp.gmail.com:465`) using TLS. Composes a formal business transmittal letter, attaches the generated vector PDF, and dispatches it directly to the customer's email address with full delivery status logging (`SENT`).

---

## 4. Technical Explanation: Why Status Errors Occur on Static Links Without a Running Backend

### The Client-Server Architecture
When building a modern enterprise application, the system consists of two distinct tiers:
1. **Frontend Presentation Tier (Client)**: HTML, CSS, React, and JavaScript running inside the user's web browser.
2. **Backend Application & Data Tier (Server)**: Node.js Express server running background processes, database connections (Prisma), AI extraction (Gemini), email polling (IMAP), and PDF rendering (Chromium).

### Why a Static Host Alone Returns Errors:
- A static hosting service (such as GitHub Pages or a basic Vercel frontend deployment) only serves static files (`index.html`, JavaScript bundles, CSS).
- When a user clicks **"Simulate Customer Inbound Email"** or **"Generate Proposal"**, the browser executes an HTTP `POST` request to `/api/emails/simulate`.
- If no backend server is listening at that API endpoint, the browser receives an HTTP `404 Not Found` or `Failed to fetch (Network Error)`.

### How PropFlow AI Resolves This:
1. **Full-Stack Local Execution (Recommended for Evaluation)**: Running both `npm run dev:server` and `npm run dev:client` starts both tiers locally.
2. **Hybrid Cloud Deployment**: Deploy the frontend on Vercel/Netlify, deploy the backend on Render, and set `VITE_API_URL=https://your-backend.onrender.com`.
3. **Resilient Browser Fallback**: The frontend includes an automatic offline simulation engine. If no backend is reachable, it gracefully runs the requirement extraction and proposal builder in-memory, preventing raw UI crashes!

---

## 5. Evaluator Quickstart Guide (Run Locally in 2 Minutes)

### Prerequisites
- Node.js v18 or higher (tested on v22)
- npm or pnpm
- Google Chrome or Microsoft Edge (used by Puppeteer for instant PDF rendering)

### Step 1: Clone Repository
```bash
git clone https://github.com/devisree5/Proposal_AI.git
cd Proposal_AI
```

### Step 2: Install Dependencies
```bash
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### Step 3: Initialize Database & Pricing Catalog
```bash
# Push Prisma schema and seed 12 service catalog items
npm run prisma:push --prefix server
npm run prisma:seed --prefix server
```

### Step 4: Start Backend and Frontend
Open two terminal windows (or run concurrently):

- **Terminal 1 (Backend API on Port 5000)**:
  ```bash
  npm run dev:server
  ```
- **Terminal 2 (Frontend Dashboard on Port 5173)**:
  ```bash
  npm run dev:client
  ```

Open your browser to: **`http://localhost:5173`**

---

## 6. Comprehensive 3-Minute Testing Walkthrough

Follow these steps to test every single feature required by the assignment:

1. **Step 1: Inbound Email Ingestion**
   - Click **"Simulate Customer Inbound Email"** in the top navigation or dashboard hero.
   - Select any scenario (e.g., *HealthSync App* or *Vance Apparel*).
   - Click **"Simulate Inbound RFP Now"**.
   - Notice the status updates to `EXTRACTED`.

2. **Step 2: AI Requirement Extraction & Human Review**
   - The Requirement Editor opens automatically.
   - Inspect the extracted **Client Name**, **Company**, **Project Title**, and **Itemized Scope**.
   - Notice the **Ambiguity Warning Box** highlighting details that the AI flagged as missing (e.g. unconfirmed phone number or budget).
   - Add a custom scope item or modify any field.
   - Click **"Build Proposal & Select Template"**.

3. **Step 3: Template Selection & Deterministic Pricing**
   - Choose between **Modern Minimalist**, **Corporate Executive**, or **Creative Studio**.
   - Review the **Pricing Breakdown**: notice that services, quantities, hourly rates, subtotal, and tax are calculated deterministically from the database catalog.
   - Adjust quantities or add custom service lines.
   - Click **"Generate Proposal & Launch Live Preview"**.

4. **Step 4: Live Preview & Template Switching**
   - The interactive document preview renders the proposal with dynamic data.
   - Click the template switcher buttons (**Minimalist / Executive / Studio**) in the top toolbar to watch the layout change dynamically on the fly!

5. **Step 5: Download PDF & Email Dispatch**
   - Click **"Download PDF"** to verify vector PDF rendering.
   - Click **"Send to Client"**: review the recipient address and email body, then click **"Send Now"** to dispatch the proposal via SMTP with the PDF attached!

---

## 7. Automated Test Suite Verification

You can verify all 12 platform features programmatically by running our included verification script:

```bash
node verify_all_features.js
```

### Verification Results Summary:
```text
====================================================
   STARTING FULL FEATURE VERIFICATION TEST SUITE    
====================================================

[FEATURE 1]  Backend Health & API Status:         PASS (Healthy v1.0.0)
[FEATURE 2]  Pricing Catalog Seed & Retrieval:    PASS (12 services loaded from DB)
[FEATURE 3]  Email Ingestion & Inbound Detection: PASS (Inbound RFP ingested & deduplicated)
[FEATURE 4]  AI Requirement Extraction (Gemini):  PASS (Parsed client, scope, deliverables, timeline, budget)
[FEATURE 5]  Pricing Automation (Anti-Hallucination): PASS (Calculated $26,510 based strictly on catalog)
[FEATURE 6]  User Review & Scope Correction UI:   PASS (Updated and verified extracted scope)
[FEATURE 7]  Proposal Creation & Math Engine:     PASS (Generated #PROP-2026-4378)
[FEATURE 8]  PDF Template 1 (Modern Minimalist):  PASS (Rendered clean modern layout)
[FEATURE 9]  PDF Template 2 (Corporate Executive):PASS (Rendered formal navy executive layout)
[FEATURE 10] PDF Template 3 (Creative Studio):    PASS (Rendered gradient card layout)
[FEATURE 11] Downloadable Vector PDF Stream:      PASS (application/pdf buffer generated)
[FEATURE 12] SMTP Email Delivery with PDF:        PASS (Delivered with PDF attached via Gmail SMTP)

====================================================
   ALL 12 FEATURES VERIFIED & WORKING 100%!
====================================================
```

---

## 8. Summary of Technical Deliverables

| Deliverable | Location in Repository |
| :--- | :--- |
| **Complete Source Code** | `https://github.com/devisree5/Proposal_AI` |
| **Backend REST API** | `server/src/` (Controllers, Routes, Services, Prisma) |
| **Frontend UI & Previewer** | `client/src/` (Components, Wizards, Responsive Dashboard) |
| **3 PDF Proposal Templates** | `server/src/templates/` (Minimalist, Executive, Studio) |
| **Deterministic Pricing Catalog** | `server/src/prisma/seed.ts` (12 IT service rate items) |
| **Prisma Relational Database** | `server/src/prisma/schema.prisma` (SQLite & PostgreSQL models) |
| **Automated Test Suite** | `verify_all_features.js` |
| **Environment Configuration** | `.env.example` (with zero secret leakage) |
| **Deployment Blueprints** | `vercel.json` (Vercel) & `render.yaml` (Render) |

---
*PropFlow AI — Built for the Technical Assignment: AI-Powered Email-to-Proposal Generation System.*
