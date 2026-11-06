import { ProposalTemplateData } from './modernMinimalist.js';

export function renderCorporateExecutive(data: ProposalTemplateData): string {
  const formatCurrency = (amt: number) => `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.6;
      padding: 0;
    }

    .top-navy-bar {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 40px 50px 32px 50px;
    }
    .top-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .corp-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #f8fafc;
    }
    .corp-subtitle {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #93c5fd;
      margin-top: 4px;
    }
    .doc-badge {
      border: 1px solid rgba(255,255,255,0.3);
      padding: 6px 14px;
      border-radius: 4px;
      text-align: right;
      background: rgba(255,255,255,0.05);
    }
    .doc-num {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .doc-date {
      font-size: 11px;
      color: #cbd5e1;
      margin-top: 2px;
    }

    .main-content {
      padding: 36px 50px 50px 50px;
    }

    .executive-card {
      background: #f8fafc;
      border-left: 4px solid #1e3a8a;
      padding: 18px 24px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 30px;
    }
    .exec-heading {
      font-family: 'Lora', serif;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .exec-desc {
      color: #475569;
      font-size: 13px;
    }

    .info-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-col-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1e3a8a;
      margin-bottom: 8px;
    }
    .info-col-name {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .info-col-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .section-header {
      font-family: 'Lora', serif;
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      padding-bottom: 6px;
      border-bottom: 2px solid #1e3a8a;
      margin-top: 32px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .scope-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .scope-box {
      border: 1px solid #cbd5e1;
      padding: 12px 16px;
      border-radius: 4px;
      background: #ffffff;
      font-size: 12px;
    }
    .scope-box strong {
      color: #1e3a8a;
      display: inline-block;
      margin-right: 6px;
    }

    .deliverables-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .deliverables-table th {
      background: #f1f5f9;
      color: #1e293b;
      border-bottom: 2px solid #94a3b8;
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }
    .deliverables-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }

    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      margin-bottom: 20px;
    }
    .pricing-table th {
      background: #1e3a8a;
      color: #ffffff;
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }
    .pricing-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 12px;
      vertical-align: top;
    }
    .custom-pill {
      background: #e0e7ff;
      color: #3730a3;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
      margin-left: 6px;
    }

    .summary-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
      margin-bottom: 32px;
    }
    .summary-table {
      width: 340px;
      border-collapse: collapse;
    }
    .summary-table td {
      padding: 6px 12px;
      font-size: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .summary-table td.amount {
      text-align: right;
      font-weight: 600;
    }
    .summary-table tr.total-row td {
      border-top: 2px solid #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      background: #f8fafc;
      font-size: 15px;
      font-weight: 800;
      color: #1e3a8a;
      padding: 10px 12px;
    }

    .terms-card {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 16px 20px;
      font-size: 11px;
      color: #475569;
      line-height: 1.7;
      border-radius: 4px;
      white-space: pre-line;
      margin-bottom: 40px;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
    }
    .sig-line {
      border-bottom: 1px solid #0f172a;
      height: 40px;
      margin-bottom: 8px;
    }
    .sig-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-role {
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="top-navy-bar">
    <div class="top-flex">
      <div>
        <div class="corp-title">${data.company.name}</div>
        <div class="corp-subtitle">Executive Enterprise Solutions</div>
      </div>
      <div class="doc-badge">
        <div class="doc-num">PROPOSAL #${data.proposalNumber}</div>
        <div class="doc-date">Issued: ${data.date}</div>
        <div class="doc-date">Expires: ${data.validUntil}</div>
      </div>
    </div>
  </div>

  <div class="main-content">
    <div class="executive-card">
      <div class="exec-heading">${data.title}</div>
      <div class="exec-desc">${data.overview}</div>
    </div>

    <div class="info-columns">
      <div>
        <div class="info-col-title">Provider Information</div>
        <div class="info-col-name">${data.company.name}</div>
        <div class="info-col-sub">${data.company.email}</div>
        <div class="info-col-sub">${data.company.phone}</div>
        <div class="info-col-sub">${data.company.address}</div>
      </div>
      <div>
        <div class="info-col-title">Client Information</div>
        <div class="info-col-name">${data.client.name}</div>
        ${data.client.company ? `<div class="info-col-sub"><strong>${data.client.company}</strong></div>` : ''}
        <div class="info-col-sub">${data.client.email}</div>
        ${data.client.phone ? `<div class="info-col-sub">${data.client.phone}</div>` : ''}
      </div>
    </div>

    <div class="section-header">Project Scope & Specifications</div>
    <div class="scope-grid">
      ${data.scopeItems.map((item, idx) => `
        <div class="scope-box">
          <strong>Section ${idx + 1}:</strong> ${item}
        </div>
      `).join('')}
    </div>

    <div class="section-header">Contractual Deliverables</div>
    <table class="deliverables-table">
      <thead>
        <tr>
          <th style="width: 30%;">Deliverable</th>
          <th style="width: 55%;">Specification</th>
          <th style="width: 15%;">Quantity</th>
        </tr>
      </thead>
      <tbody>
        ${data.deliverables.map(del => `
          <tr>
            <td style="font-weight: 600; color: #0f172a;">${del.title}</td>
            <td style="color: #475569;">${del.description}</td>
            <td>${del.quantity || '1 Complete Unit'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-header">Financial Schedule & Commercial Terms</div>
    <table class="pricing-table">
      <thead>
        <tr>
          <th style="width: 45%;">Service Component</th>
          <th style="width: 15%;">Billing Unit</th>
          <th style="width: 10%; text-align: right;">Units</th>
          <th style="width: 15%; text-align: right;">Unit Rate</th>
          <th style="width: 15%; text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${data.pricingItems.map(item => `
          <tr>
            <td>
              <div style="font-weight: 700; color: #0f172a;">
                ${item.name}
                ${item.isCustom ? `<span class="custom-pill">CUSTOM QUOTE</span>` : ''}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.description}</div>
            </td>
            <td>${item.unitType.toUpperCase()}</td>
            <td style="text-align: right;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.unitRate)}</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">${formatCurrency(item.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="summary-wrap">
      <table class="summary-table">
        <tr>
          <td>Subtotal</td>
          <td class="amount">${formatCurrency(data.subtotal)}</td>
        </tr>
        ${data.discountAmount > 0 ? `
          <tr style="color: #15803d;">
            <td>Commercial Discount</td>
            <td class="amount">-${formatCurrency(data.discountAmount)}</td>
          </tr>
        ` : ''}
        <tr>
          <td>Applicable Tax (${data.taxPercent}%)</td>
          <td class="amount">${formatCurrency(data.taxAmount)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Commercial Value</td>
          <td class="amount">${formatCurrency(data.totalAmount)}</td>
        </tr>
      </table>
    </div>

    <div class="section-header">Master Service Terms</div>
    <div class="terms-card">${data.termsAndConditions}</div>

    <div class="signature-grid">
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">Authorized Representative</div>
        <div class="sig-role">${data.company.name}</div>
      </div>
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">Client Acceptance</div>
        <div class="sig-role">${data.client.company || data.client.name}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
