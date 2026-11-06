# PropFlow AI: AI-Powered Email-to-Proposal Generation System
## Complete Evaluator Guide, Architecture Deep Dive & Technical Manual

> **Repository URL**: [https://github.com/devisree5/Proposal_AI](https://github.com/devisree5/Proposal_AI)  
> **Author / Submitter**: Borra Devisree  
> **Project Title**: PropFlow AI — Intelligent B2B Sales Proposal Automation Engine  
> **Document Purpose**: Technical architecture reference, evaluator quickstart, and explanation of full-stack client-server mechanics.

---

## Table of Contents
1. [Executive Summary & Primary Idea](#1-executive-summary--primary-idea)
2. [Why Status Errors Occur on Static Links (Client vs Server Architecture)](#2-why-status-errors-occur-on-static-links)
3. [Quickstart Guide: Running the Full Platform Locally in 2 Minutes](#3-quickstart-guide-running-the-full-platform-locally)
4. [Step-by-Step 3-Minute Evaluator Demo Walkthrough](#4-step-by-step-3-minute-evaluator-demo-walkthrough)
5. [Automated 12-Feature Test Suite Verification](#5-automated-12-feature-test-suite-verification)
6. [Detailed Feature-by-Feature Architecture](#6-detailed-feature-by-feature-architecture)
   - [Feature A: Inbound Email Ingestion & Deduplication](#feature-a-inbound-email-ingestion--deduplication)
   - [Feature B: AI-Powered Requirement Extraction & Ambiguity Detection](#feature-b-ai-powered-requirement-extraction--ambiguity-detection)
   - [Feature C: Human-in-the-Loop Review & Verification UI](#feature-c-human-in-the-loop-review--verification-ui)
   - [Feature D: Deterministic Pricing Automation (Zero AI Hallucination)](#feature-d-deterministic-pricing-automation)
   - [Feature E: Dynamic Multi-Template PDF Generation](#feature-e-dynamic-multi-template-pdf-generation)
   - [Feature F: Live Preview, Vector PDF Download & Gmail SMTP Outbound Dispatch](#feature-f-live-preview-download--smtp-dispatch)
7. [Technical Stack & Design Decisions](#7-technical-stack--design-decisions)
8. [Production Deployment Architecture (Vercel + Render)](#8-production-deployment-architecture)
9. [Ready-to-Send Evaluator Submission Note](#9-ready-to-send-evaluator-submission-note)

---

## 1. Executive Summary & Primary Idea

### 1.1 The Business Problem
In B2B software engineering, IT consulting, and agency services, inbound prospective clients submit request-for-proposals (RFPs) and service inquiries as **unstructured text emails**.

Historically, sales teams face four critical challenges:
1. **Turnaround Lag**: Sales engineers spend 24 to 72 hours reading unstructured emails, copying specs into spreadsheets, estimating costs, drafting documents, and generating quotes.
2. **Pricing Inconsistency & AI Hallucination**: Generative AI tools frequently invent random hourly rates, hallucinate non-existent line items, or miscalculate currency totals, damaging company margins.
3. **Template Rigidity**: Enterprise clients, government tenders, and modern agile startups expect completely different proposal presentations (e.g., formal legal terms vs. sleek modern visual summaries).
4. **Disjointed Tooling**: Email clients (Gmail/Outlook), spreadsheets (Excel), word processors (Word/Docs), and document signing tools are disconnected, leading to dropped leads and lost data.

### 1.2 The PropFlow AI Solution
**PropFlow AI** is an enterprise-grade automated sales workflow platform that transforms raw incoming customer inquiry emails into verified, professionally styled B2B proposals in seconds:

```
[Inbound Customer Email]
         │ (Gmail IMAP or In-App Simulator)
         ▼
[Deduplication & Intake Layer] ── (Prevents duplicate proposals via RFC-822 messageId)
         │
         ▼
[Google Gemini AI Extraction] ── (Parses client info, scope, deliverables, timeline, budget, & flags missing info)
         │
         ▼
[Human-in-the-Loop Review UI] ── (Sales rep inspects raw email vs extracted fields, edits, and verifies)
         │
         ▼
[Deterministic Pricing Engine] ── (Zero AI hallucination: matches 12-item database catalog; computes hours, rates, tax)
         │
         ▼
[Multi-Template PDF Generator] ── (Puppeteer renders Modern Minimalist, Corporate Executive, or Creative Studio)
         │
         ▼
[Live Preview & SMTP Delivery] ── (Real-time document preview, vector PDF download, automated email dispatch)
```

---

## 2. Why Status Errors Occur on Static Links

### The Architectural Distinction: Client vs. Server
Modern enterprise web applications are divided into two distinct components:
1. **Frontend Presentation Tier (Client)**: HTML5, CSS3, React, and JavaScript executing inside the user's web browser.
2. **Backend Application & Data Tier (Server)**: A Node.js Express server connected to a relational database (Prisma ORM), executing secure tasks:
   - IMAP network sockets to scan Gmail inboxes
   - Google Gemini API calls with server-side API keys
   - Relational database transactions and catalog joins
   - Headless Chromium (Puppeteer) process execution to compile vector PDFs
   - SMTP TLS dispatch to send outbound emails with attachments

### Why Static Links (GitHub Pages / Static Vercel) Show Status Errors Without Backend
- Static hosting providers (like GitHub Pages or a basic Vercel frontend build) only serve static static files (`index.html`, JavaScript bundles, CSS).
- When a user clicks **"Simulate Customer Inbound Email"** or **"Send to Client"**, the browser makes an HTTP `POST` request to `/api/emails/simulate`.
- If no backend server is running on that host or listening on port 5000, the browser cannot connect to a server and throws an error:
  `HTTP 404 Not Found`, `500 Proxy Error`, or `Failed to fetch (Network Error)`.

### How PropFlow AI Resolves This (Dual Execution Modes)
To guarantee seamless evaluation, PropFlow AI implements two operating modes:

1. **Full-Stack Mode (Recommended & Production-Grade)**:
   - Running both the backend (`npm run dev:server`) and frontend (`npm run dev:client`) locally.
   - Activates full Google Gemini AI parsing, live Gmail IMAP synchronization, Prisma database persistence, Chromium vector PDF generation, and real Gmail SMTP dispatch.
   - The top navigation bar displays a green **`API Online`** status pill.

2. **Resilient Client Preview Mode (Built-In Offline Fallback)**:
   - If the frontend is run on a static link or without the backend running, the frontend's API layer automatically engages an in-memory & `localStorage` simulation engine.
   - It simulates realistic B2B RFP scenarios (*HealthSync Telehealth*, *Vance Luxury Apparel*, *NovaData AI*), calculates deterministic pricing from the 12-item catalog, renders interactive proposals across all 3 templates, and allows browser printing without throwing unhandled network errors!
   - The top navigation bar displays an amber **`Demo / Static Mode`** status pill.

---

## 3. Quickstart Guide: Running the Full Platform Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (tested on Node v20 & v22)
- **Package Manager**: npm (bundled with Node.js)
- **Browser**: Google Chrome or Microsoft Edge (used by Puppeteer for instant PDF rendering)

### 3-Step Setup

#### Step 1: Clone Repository
```bash
git clone https://github.com/devisree5/Proposal_AI.git
cd Proposal_AI
```

#### Step 2: One-Command Installation & Database Setup
Run our pre-configured setup command that installs dependencies for both backend and frontend, applies the Prisma database migrations, and pre-seeds the 12-item pricing catalog:
```bash
npm run setup
```
*(Alternatively, you can run `npm install --prefix server && npm install --prefix client && npm run prisma:push --prefix server && npm run prisma:seed --prefix server`)*.

#### Step 3: Launch Both Servers
Open two terminal windows:

- **Terminal 1: Start Backend API (Port 5000)**
  ```bash
  npm run dev:server
  ```
  *You will see: `[Server] PropFlow AI backend running at http://localhost:5000`*

- **Terminal 2: Start Frontend Dashboard (Port 5173)**
  ```bash
  npm run dev:client
  ```
  *You will see: `Local: http://localhost:5173/`*

Open your browser to: **`http://localhost:5173`**

---

## 4. Step-by-Step 3-Minute Evaluator Demo Walkthrough

Follow these steps in your browser to evaluate all platform features:

### Step 1: Trigger an Inbound Customer Service RFP
1. On the dashboard, click the blue button: **"Simulate Customer Inbound Email"**.
2. Select any of the pre-configured realistic B2B scenarios:
   - **HealthSync Technologies**: HIPAA-compliant Telehealth Mobile App ($25k–$35k).
   - **Vance Luxury Apparel**: Headless Next.js E-Commerce Replatforming ($30k–$40k).
   - **NovaData AI**: B2B Enterprise SaaS Architecture & RAG Document Copilot ($35k–$45k).
3. Click **"Simulate Inbound RFP Now"**.
4. The system ingests the email, assigns a unique RFC-822 `messageId`, performs deduplication, and hands the message to the AI extraction layer.

### Step 2: Inspect AI Requirement Extraction & Ambiguity Flags
1. The **Requirement Editor Modal** opens automatically with structured fields extracted from the unstructured email:
   - **Client Metadata**: Contact name, company name, email, phone number.
   - **Project Scope**: Itemized functional requirements.
   - **Deliverables**: Quantified contractual deliverables.
   - **Timeline & Budget**: Identified delivery target and indicated budget.
2. Notice the yellow **"Missing / Unclear Information Identified by AI"** box:
   - The AI automatically flags ambiguities (e.g., missing phone number, unconfirmed payment gateway, or required compliance sign-offs) so sales reps never submit incomplete proposals!
3. Edit any field, add a custom scope item, or verify the information.
4. Click **"Build Proposal & Select Template"**.

### Step 3: Choose Proposal Template & Review Deterministic Pricing
1. In the **Proposal Builder**, select your preferred document visual identity:
   - **Modern Minimalist**: Ultra-clean sans-serif styling for agile consultancies.
   - **Corporate Executive**: Navy banner with serif typography for enterprise/corporate clients.
   - **Creative Studio**: Indigo/purple gradient card layout for creative tech agencies.
2. Review the **Commercial Investment Breakdown**:
   - The system deterministically matches catalog service codes (`ENG-MOB-FLUT`, `ENG-BE-NODE`, `OPS-CLOUD-ARCH`, `SEC-AUDIT`), assigns verified hourly/milestone rates, and mathematically calculates subtotal, tax (10%), and final total.
   - AI is strictly prohibited from hallucinating or altering prices.
3. Click **"Generate Proposal & Launch Live Preview"**.

### Step 4: Interactive Live Preview & Real-Time Template Switching
1. The **Interactive Document Previewer** displays the complete, formatted proposal document with dynamic data.
2. In the top toolbar, click the template switcher buttons (**Minimalist / Executive / Studio**):
   - Notice the document layout, font pairing, table styling, and branding change dynamically in real time!
3. Click **"Download PDF"** to stream the pixel-perfect vector PDF.

### Step 5: Live Outbound SMTP Email Dispatch
1. In the preview header, click **"Send to Client"**.
2. Inspect the pre-composed formal business transmittal letter.
3. Enter your own email address (or keep the default client email).
4. Click **"Send Now"**:
   - The backend connects via secure TLS to Gmail SMTP, compiles the vector PDF, attaches it to the email, and delivers it directly to the recipient's inbox.
   - The proposal status updates to **`SENT`** with complete delivery timestamps.

---

## 5. Automated 12-Feature Test Suite Verification

For rapid automated grading, we have included a comprehensive programmatic verification test suite.

Run this single command in your terminal while the backend is running:
```bash
npm run test:features
```
*(or `node verify_all_features.js`)*

### Sample Output:
```text
====================================================
   STARTING FULL FEATURE VERIFICATION TEST SUITE    
====================================================

[FEATURE 1] Backend Health & API Status:         PASS (Healthy v1.0.0)
[FEATURE 2] Pricing Catalog Seed & Retrieval:    PASS (12 services loaded from DB)
[FEATURE 3] Email Ingestion & Inbound Detection: PASS (Inbound RFP ingested & deduplicated)
[FEATURE 4] AI Requirement Extraction (Gemini):  PASS (Parsed client, scope, deliverables, timeline, budget)
[FEATURE 5] Pricing Automation (Anti-Hallucination): PASS (Calculated $26,510 strictly based on catalog)
[FEATURE 6] User Review & Scope Correction UI:   PASS (Updated and verified extracted scope)
[FEATURE 7] Proposal Creation & Math Engine:     PASS (Generated #PROP-2026-4378)
[FEATURE 8] PDF Template 1 (Modern Minimalist):  PASS (Rendered clean modern layout)
[FEATURE 9] PDF Template 2 (Corporate Executive):PASS (Rendered formal navy executive layout)
[FEATURE 10] PDF Template 3 (Creative Studio):   PASS (Rendered gradient card layout)
[FEATURE 11] Downloadable Vector PDF Stream:     PASS (application/pdf buffer generated)
[FEATURE 12] SMTP Email Delivery with PDF:       PASS (Delivered with PDF attached via Gmail SMTP)

====================================================
   ALL 12 FEATURES VERIFIED & WORKING 100%!
====================================================
```

---

## 6. Detailed Feature-by-Feature Architecture

### Feature A: Inbound Email Ingestion & Deduplication
- **File**: `server/src/services/emailService.ts`
- **IMAP Protocol**: Connects over secure TLS (`port 993`) to `imap.gmail.com` using `mailparser`.
- **RFC-822 Deduplication**: Inspects the unique `messageId` header. If an email with the same `messageId` exists in the database, it is safely skipped, preventing duplicate proposals or redundant billing.
- **Service Request Classification**: Analyzes message content against service-inquiry keywords (`rfp`, `quote`, `proposal`, `develop`, `services`, `budget`, `timeline`). Personal or spam messages are filtered out.
- **In-App Simulator**: Allows evaluators to trigger real-world customer inquiries in 1 click without requiring third-party email setup.

### Feature B: AI-Powered Requirement Extraction & Ambiguity Detection
- **File**: `server/src/services/aiExtractor.ts`
- **Model**: Powered by Google Gemini API (`@google/generative-ai`) with structured JSON schema enforcement.
- **Extracted Entities**:
  1. Client metadata (Contact name, company, email, phone)
  2. Project title and executive overview
  3. Scope items (itemized functional requirements)
  4. Contractual deliverables with quantities
  5. Target timeline and budget range
  6. **Ambiguity & Missing Information Flags**: Crucial safeguard that detects unstated details (e.g. missing phone numbers, unconfirmed compliance requirements, or vague deadlines).
- **Heuristic Fallback Engine**: If network restrictions or API rate limits prevent remote LLM calls, a rule-based NLP parser automatically extracts entities via regex and semantic tokenizers, ensuring the application **never crashes or blocks the evaluator**.

### Feature C: Human-in-the-Loop Review & Verification UI
- **Files**: `client/src/components/RequirementEditorModal.tsx` & `client/src/components/ProposalBuilderModal.tsx`
- **Human Verification**: Sales engineers review the extracted entities side-by-side with the original raw email text.
- **Interactive Editing**: Sales reps can add or remove scope items, update deliverable quantities, and resolve missing details before generating financial quotes.

### Feature D: Deterministic Pricing Automation (Zero AI Hallucination)
- **File**: `server/src/services/pricingService.ts`
- **The Golden Rule**: *AI is strictly prohibited from inventing or modifying prices.*
- **Pre-Seeded 12-Item Catalog**: Verified rate cards stored in the database covering Engineering, Design, DevOps, QA, Security, and Support (e.g., React Frontend @ $95/hr, Flutter Mobile @ $120/hr, Cloud Architecture @ $130/hr, Full-Stack MVP @ $8,500/milestone).
- **Deterministic Keyword Matcher**: Scans verified scope items against catalog keywords. Calculates `total = quantity * unitRate`, `subtotal = sum(totals)`, `tax = (subtotal * taxPercent) / 100`, and `finalTotal = subtotal + tax - discount`.
- **Custom Quote Flags**: Requirements that cannot be matched to existing catalog entries are explicitly flagged as `"Custom Quote Required"`, preventing hidden costs.

### Feature E: Dynamic Multi-Template PDF Generation
- **Files**: `server/src/templates/modernMinimalist.ts`, `corporateExecutive.ts`, `creativeStudio.ts`, and `server/src/services/pdfService.ts`
- **3 Distinct Visual Designs**:
  1. **Modern Minimalist**: Crisp sans-serif typography, clean dividing borders, subtle grid badges.
  2. **Corporate Executive**: Deep navy header banner, classic serif typography, high-contrast tables.
  3. **Creative Studio**: Vibrant gradient accents, card-based layout, milestone pill badges.
- **Headless Chromium Engine**: Puppeteer renders pixel-perfect A4 vector PDFs with print backgrounds and exact margin control.

### Feature F: Live Preview, Vector PDF Download & Gmail SMTP Outbound Dispatch
- **Files**: `client/src/components/ProposalPreviewModal.tsx` & `server/src/routes/proposalRoutes.ts`
- **Interactive Live Preview**: High-fidelity HTML rendering with real-time template switching.
- **Vector PDF Download**: Direct binary stream download (`application/pdf`).
- **SMTP Outbound Delivery**: Connects to Gmail SMTP (`port 465`) using TLS. Composes a formal business transmittal letter, attaches the generated vector PDF, and dispatches it directly to the customer's email address.

---

## 7. Technical Stack & Design Decisions

| Component | Technology | Rationale & Justification |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 + Vite + Tailwind CSS + Lucide Icons** | Instantaneous hot reloading, zero hydration latency for dynamic document iframe previews, and responsive modern dashboard. |
| **Backend API** | **Node.js (Express + TypeScript)** | Asynchronous event loop, unified TypeScript types between client and server, native child process management for Puppeteer. |
| **Database & ORM** | **Prisma ORM with SQLite (Dev) & PostgreSQL (Prod)** | Type-safe schema definition with dual-dialect abstraction. Enables zero-config local testing on SQLite and production-grade reliability on PostgreSQL. |
| **AI Extraction Engine** | **Google Gemini API (`@google/generative-ai`)** | High-speed, structured JSON schema enforcement with built-in heuristic fallback parser. |
| **Document Generation** | **Puppeteer (Headless Chromium)** | High-fidelity vector PDF generation from dynamic HTML/CSS templates. Ensures crisp vector typography and print-ready margins. |
| **Email Protocol** | **IMAP (`mailparser`) & SMTP (`nodemailer`)** | Direct protocol-level integration supporting standard TLS/SSL connections for Gmail and Outlook with App Password authentication. |

---

## 8. Production Deployment Architecture

For cloud deployment, the platform is configured for modern serverless and PaaS platforms:

- **Frontend (Vercel / Netlify)**:
  - Configuration files: `vercel.json` and `_redirects`
  - Build command: `npm run build --prefix client`
  - Output directory: `client/dist`
  - Environment variable: `VITE_API_URL=https://your-backend.onrender.com`

- **Backend (Render / Railway / AWS)**:
  - Blueprint: `render.yaml`
  - Build command: `npm install --prefix server && npm run prisma:push --prefix server && npm run prisma:seed --prefix server`
  - Start command: `npm run dev:server`
  - Environment variables: `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `DATABASE_URL`

---

## 9. Ready-to-Send Evaluator Submission Note

*Copy and paste this message when submitting your assignment via email, form, or GitHub:*

```text
Subject: Submission: AI-Powered Email-to-Proposal Generation System (PropFlow AI)

Dear Evaluation Team,

I am pleased to submit my solution for the AI-Powered Email-to-Proposal Generation System: PropFlow AI.

• GitHub Repository: https://github.com/devisree5/Proposal_AI
• Complete Evaluator Guide & Manual: https://github.com/devisree5/Proposal_AI/blob/main/EVALUATOR_GUIDE_AND_DOCUMENTATION.md

Quickstart (Run Locally in 2 Minutes):
1. git clone https://github.com/devisree5/Proposal_AI.git
2. cd Proposal_AI
3. npm run setup
4. In Terminal 1: npm run dev:server (Port 5000)
5. In Terminal 2: npm run dev:client (Port 5173 -> http://localhost:5173)

Automated Test Verification:
You can verify all 12 core features programmatically by running:
npm run test:features

Key Architectural Highlights:
1. Inbound Ingestion & Deduplication: IMAP polling (Gmail TLS) + RFC-822 messageId deduplication + In-App B2B RFP Simulator.
2. AI Requirement Extraction: Google Gemini API structured extraction (client info, scope, deliverables, timeline, budget) + ambiguity/missing info flags + heuristic fallback parser.
3. Human-in-the-Loop Review: Side-by-side raw email vs extracted fields review and verification UI.
4. Deterministic Pricing (Anti-Hallucination): Pre-seeded 12-item catalog, deterministic keyword matching, and automated tax/subtotal calculation (AI is strictly prohibited from inventing prices).
5. Multi-Template PDF Engine: 3 distinct vector PDF templates (Modern Minimalist, Corporate Executive, Creative Studio) rendered via Puppeteer.
6. Live Preview & SMTP Dispatch: Real-time template switching preview, vector PDF download stream, and automated Gmail SMTP delivery with PDF attachment.

Please refer to EVALUATOR_GUIDE_AND_DOCUMENTATION.md in the repository root for the comprehensive architecture documentation and evaluation walkthrough.

Best regards,
Borra Devisree
borradevisree20@gmail.com
```

---
*PropFlow AI — Built for the Technical Assignment: AI-Powered Email-to-Proposal Generation System.*
