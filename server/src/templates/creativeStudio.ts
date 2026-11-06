import { ProposalTemplateData } from './modernMinimalist.js';

export function renderCreativeStudio(data: ProposalTemplateData): string {
  const formatCurrency = (amt: number) => `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.6;
      padding: 40px;
    }

    .top-hero {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
      border-radius: 12px;
      color: #ffffff;
      padding: 32px 36px;
      margin-bottom: 28px;
    }
    .top-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .studio-brand {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .studio-badge {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .hero-meta {
      display: flex;
      gap: 20px;
      margin-top: 20px;
      font-size: 12px;
      opacity: 0.9;
    }

    .client-card-banner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 20px;
    }
    .info-card-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6366f1;
      margin-bottom: 6px;
    }
    .info-card-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .info-card-text {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .project-card {
      border: 2px solid #e0e7ff;
      border-radius: 10px;
      padding: 20px 24px;
      background: #faf5ff;
      margin-bottom: 28px;
    }
    .proj-title {
      font-size: 18px;
      font-weight: 800;
      color: #4338ca;
      margin-bottom: 6px;
    }
    .proj-text {
      color: #4b5563;
      font-size: 13px;
    }

    .pill-header {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 24px;
      margin-bottom: 14px;
    }
    .pill-dot {
      width: 8px;
      height: 8px;
      background: #4f46e5;
      border-radius: 50%;
    }

    .scope-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .scope-pill {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #7c3aed;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .deliverables-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }
    .deliv-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .deliv-main {
      font-weight: 700;
      color: #0f172a;
      font-size: 13px;
    }
    .deliv-sub {
      color: #64748b;
      font-size: 12px;
      margin-top: 2px;
    }
    .deliv-qty-pill {
      background: #e0e7ff;
      color: #4338ca;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .creative-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 8px;
      margin-top: 8px;
      margin-bottom: 16px;
    }
    .creative-table th {
      padding: 8px 14px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      text-align: left;
    }
    .creative-table td {
      background: #f8fafc;
      padding: 12px 14px;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .creative-table tr td:first-child {
      border-left: 1px solid #e2e8f0;
      border-radius: 8px 0 0 8px;
    }
    .creative-table tr td:last-child {
      border-right: 1px solid #e2e8f0;
      border-radius: 0 8px 8px 0;
      text-align: right;
      font-weight: 700;
      color: #4f46e5;
    }

    .pricing-summary {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      margin-bottom: 28px;
    }
    .pricing-box {
      width: 320px;
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border: 1px solid #d8b4fe;
      border-radius: 10px;
      padding: 16px 20px;
    }
    .pricing-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      color: #4b5563;
    }
    .pricing-total {
      border-top: 2px dashed #a855f7;
      margin-top: 8px;
      padding-top: 8px;
      font-size: 16px;
      font-weight: 800;
      color: #581c87;
    }

    .terms-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 14px 18px;
      font-size: 11px;
      color: #64748b;
      white-space: pre-line;
      margin-bottom: 32px;
    }

    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
    }
    .sig-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      background: #ffffff;
    }
    .sig-title {
      font-size: 11px;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .sig-name {
      font-weight: 700;
      font-size: 12px;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="top-hero">
    <div class="top-flex">
      <div>
        <div class="studio-brand">${data.company.name}</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">Next-Gen Digital Solutions & Design</div>
      </div>
      <div class="studio-badge">
        PROPOSAL ${data.proposalNumber}
      </div>
    </div>
    <div class="hero-meta">
      <div>Issued: <strong>${data.date}</strong></div>
      <div>Valid Until: <strong>${data.validUntil}</strong></div>
      <div>Delivery: <strong>${data.timelineWeeks ? `${data.timelineWeeks} Weeks` : 'Flexible'}</strong></div>
    </div>
  </div>

  <div class="client-card-banner">
    <div class="info-card">
      <div class="info-card-label">PROPOSED BY</div>
      <div class="info-card-title">${data.company.name}</div>
      <div class="info-card-text">${data.company.email}</div>
      <div class="info-card-text">${data.company.phone}</div>
      <div class="info-card-text">${data.company.address}</div>
    </div>
    <div class="info-card">
      <div class="info-card-label">CLIENT PARTNER</div>
      <div class="info-card-title">${data.client.name}</div>
      ${data.client.company ? `<div class="info-card-text"><strong>${data.client.company}</strong></div>` : ''}
      <div class="info-card-text">${data.client.email}</div>
      ${data.client.phone ? `<div class="info-card-text">${data.client.phone}</div>` : ''}
    </div>
  </div>

  <div class="project-card">
    <div class="proj-title">${data.title}</div>
    <div class="proj-text">${data.overview}</div>
  </div>

  <div class="pill-header"><span class="pill-dot"></span> Core Scope & Architecture</div>
  <div class="scope-cards">
    ${data.scopeItems.map(item => `
      <div class="scope-pill">${item}</div>
    `).join('')}
  </div>

  <div class="pill-header"><span class="pill-dot"></span> Key Deliverables</div>
  <div class="deliverables-stack">
    ${data.deliverables.map(del => `
      <div class="deliv-row">
        <div>
          <div class="deliv-main">${del.title}</div>
          <div class="deliv-sub">${del.description}</div>
        </div>
        <div class="deliv-qty-pill">${del.quantity || '1x'}</div>
      </div>
    `).join('')}
  </div>

  <div class="pill-header"><span class="pill-dot"></span> Investment Breakdown</div>
  <table class="creative-table">
    <thead>
      <tr>
        <th style="width: 45%;">Service Line</th>
        <th style="width: 15%;">Unit Type</th>
        <th style="width: 10%; text-align: right;">Qty</th>
        <th style="width: 15%; text-align: right;">Unit Rate</th>
        <th style="width: 15%; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${data.pricingItems.map(item => `
        <tr>
          <td>
            <div style="font-weight: 700;">${item.name}</div>
            <div style="font-size: 11px; color: #64748b;">${item.description}</div>
          </td>
          <td>${item.unitType}</td>
          <td style="text-align: right;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.unitRate)}</td>
          <td>${formatCurrency(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="pricing-summary">
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Subtotal</span>
        <span>${formatCurrency(data.subtotal)}</span>
      </div>
      ${data.discountAmount > 0 ? `
        <div class="pricing-row" style="color: #059669;">
          <span>Studio Discount</span>
          <span>-${formatCurrency(data.discountAmount)}</span>
        </div>
      ` : ''}
      <div class="pricing-row">
        <span>Estimated Tax (${data.taxPercent}%)</span>
        <span>${formatCurrency(data.taxAmount)}</span>
      </div>
      <div class="pricing-row pricing-total">
        <span>Total Investment</span>
        <span>${formatCurrency(data.totalAmount)}</span>
      </div>
    </div>
  </div>

  <div class="pill-header"><span class="pill-dot"></span> Project Agreement Terms</div>
  <div class="terms-box">${data.termsAndConditions}</div>

  <div class="signatures">
    <div class="sig-card">
      <div class="sig-title">Studio Sign-off</div>
      <div class="sig-name">${data.company.name}</div>
    </div>
    <div class="sig-card">
      <div class="sig-title">Client Acceptance</div>
      <div class="sig-name">${data.client.company || data.client.name}</div>
    </div>
  </div>
</body>
</html>
  `;
}
