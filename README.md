# PropFlow AI - AI-Powered Email-to-Proposal Generation System

> An enterprise-grade B2B sales automation platform that converts customer inquiry emails into verified, customizable, professional PDF business proposals in seconds.

---

## 1. System Overview

**PropFlow AI** bridges the gap between incoming client service requests and professional proposal delivery. It simulates a real-world sales engineering workflow:
1. **Email Ingestion Layer**: Connects via secure IMAP (Gmail / Outlook) or uses an interactive **In-App Simulator** with realistic B2B RFP scenarios. Employs `messageId` hashing to guarantee zero duplicate processing.
2. **AI-Driven Requirement Extraction**: Uses **Google Gemini** with structured JSON output enforcement to parse client metadata, executive summary, itemized scope, deliverables with quantities, estimated timeline, budget, and flags missing/ambiguous details.
3. **Deterministic Pricing Engine**: Enforces strict anti-hallucination safeguards — AI never invents prices. Extracted requirements are matched to a pre-seeded, editable **Pricing Catalog** in the database, with automated calculation of quantities, unit rates, subtotals, configurable taxes, and discounts. Unmatched custom requirements are flagged for manual pricing.
4. **Multi-Template Vector PDF Generation**: Features **3 distinct professional templates** rendered via headless Chromium (Puppeteer):
   - **Modern Minimalist**: Crisp tech typography, subtle borders, contemporary agency aesthetic.
   - **Corporate Executive**: Formal navy header, classic serif headings, executive callout boxes.
   - **Creative Studio**: Vibrant gradient accents, card blocks, modern product studio feel.
5. **Interactive Preview, Approval & SMTP Dispatch**: Side-by-side live HTML/PDF previewer, template switching on the fly, and 1-click email delivery attaching the generated vector PDF via SMTP (`nodemailer`).

---

## 2. Architecture & Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + Tailwind CSS + Lucide | Fast, responsive dashboard, real-time preview iframe, interactive wizards |
| **Backend** | Node.js + Express + TypeScript | Modular REST API with structured controllers and service layers |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) via Prisma ORM | Relational schema with auto-migrations and catalog seed |
| **AI Extraction** | Google Gemini API (`@google/generative-ai`) | Structured schema extraction with fallback heuristic parser |
| **PDF Rendering** | Puppeteer (Headless Chromium) | Pixel-perfect vector PDF generation from dynamic HTML templates |
| **Email Protocol** | IMAP (`mailparser`) + SMTP (`nodemailer`) | Secure Gmail/Outlook integration with App Password support |

---

## 3. Getting Started (Local Development)

### Prerequisites
- Node.js v18+ (tested on v22)
- npm or pnpm
- Google Chrome or Microsoft Edge installed (used by Puppeteer for instant PDF rendering)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Anvayuone
   ```

2. **Install dependencies:**
   ```bash
   # Install server packages
   npm install --prefix server

   # Install client packages
   npm install --prefix client
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `server/.env`:
   ```bash
   cp .env.example server/.env
   ```
   *The `.env` file comes pre-configured with SQLite and your email credentials.*

4. **Initialize Database & Seed Pricing Catalog:**
   ```bash
   npm run prisma:push --prefix server
   npm run prisma:seed --prefix server
   ```

5. **Start Dev Servers:**
   - **Backend API**:
     ```bash
     npm --prefix server run dev
     # Runs at http://localhost:5000
     ```
   - **Frontend Dashboard**:
     ```bash
     npm --prefix client run dev
     # Runs at http://localhost:5173
     ```

Open your browser to: **`http://localhost:5173`**

---

## 4. How to Test the Complete End-to-End Workflow

1. **Simulate an Inbound Customer Email**:
   - In the dashboard, click **"Simulate Customer Inbound Email"**.
   - Pick one of 3 realistic scenarios:
     - *HealthSync App*: Telehealth mobile app RFP ($25k-$35k)
     - *Vance Apparel*: E-commerce replatforming & UI/UX redesign
     - *NovaData AI*: Enterprise SaaS architecture & RAG pipeline
   - Click **"Simulate Inbound RFP Now"**.
2. **Review & Correct Extracted Requirements**:
   - The AI automatically extracts client details, deliverables, timeline, budget, and flags missing items (e.g., missing phone or budget).
   - Sales reps can modify any field, add custom scope items, and verify data.
3. **Select Design Template & Configure Pricing**:
   - Click **"Build Proposal & Select Template"**.
   - Select 1 of 3 templates: **Modern Minimalist**, **Corporate Executive**, or **Creative Studio**.
   - Review the automated Pricing Breakdown matched from the Service Catalog. Adjust quantities, add custom quotes, or apply discounts.
4. **Live Preview & Download**:
   - Click **"Generate Proposal"**.
   - The interactive viewer displays the rendered proposal. You can switch templates on the fly to see layout variations.
   - Click **"Download PDF"** to get the crisp vector PDF document.
5. **Send to Customer**:
   - Click **"Send to Client"**.
   - The proposal document is attached as a PDF and dispatched directly to the customer's email via SMTP.

---

## 5. Deployment Instructions

### Frontend Deployment (Vercel)
1. Push source code to your GitHub repository.
2. In [Vercel](https://vercel.com), click **Add New Project** and select your repository.
3. Set **Root Directory** to `client`.
4. Framework Preset: **Vite**.
5. Set Environment Variable:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://propflow-api.onrender.com`).
6. Deploy!

### Backend Deployment (Render)
1. In [Render](https://render.com), create a new **Web Service** connected to your repository.
2. Set **Root Directory** to `server`.
3. Build Command:
   ```bash
   npm install && npm run prisma:push && npm run prisma:seed
   ```
4. Start Command:
   ```bash
   npm start
   ```
5. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (from Render Postgres or Neon.tech).
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_PASS`: Your 16-character Gmail App Password.
   - `CLIENT_URL`: Your Vercel frontend URL.
6. For PostgreSQL on Render: In `server/src/prisma/schema.prisma`, simply switch `provider = "sqlite"` to `provider = "postgresql"`.

---

## 6. Security & Credentials
- All secrets and API credentials are kept strictly in `.env` files and omitted from version control via `.gitignore`.
- Deduplication prevents email spam or duplicate quote billing.
- Anti-hallucination architecture ensures financial computations are deterministic and rule-governed.
