export interface ProposalTemplateData {
  proposalNumber: string;
  date: string;
  validUntil: string;
  company: {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    address: string;
  };
  client: {
    name: string;
    company?: string;
    email: string;
    phone?: string;
  };
  title: string;
  overview: string;
  scopeItems: string[];
  deliverables: Array<{ title: string; description: string; quantity?: string | number }>;
  pricingItems: Array<{
    code: string;
    name: string;
    description: string;
    unitType: string;
    quantity: number;
    unitRate: number;
    total: number;
    isCustom?: boolean;
  }>;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  timelineWeeks?: number;
  milestones?: Array<{ phase: string; duration: string; description: string }>;
  termsAndConditions: string;
}

export function renderModernMinimalist(data: ProposalTemplateData): string {
  const formatCurrency = (amt: number) => `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.6;
      padding: 40px 50px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .brand-tagline {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
    }
    .prop-pill {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .meta-text {
      color: #64748b;
      font-size: 11px;
    }

    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 32px;
    }
    .party-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .party-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .party-detail {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }

    .project-header {
      margin-bottom: 28px;
    }
    .project-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      border-left: 3px solid #2563eb;
      padding-left: 10px;
      margin-top: 28px;
      margin-bottom: 14px;
    }
    
    .scope-list {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .scope-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 12px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .scope-item::before {
      content: "✔";
      color: #2563eb;
      font-weight: bold;
    }

    .deliverables-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }
    .deliverable-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 16px;
      background: #fafafa;
    }
    .deliv-title {
      font-weight: 600;
      color: #0f172a;
      font-size: 13px;
    }
    .deliv-desc {
      color: #64748b;
      font-size: 12px;
      margin-top: 3px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      margin-bottom: 20px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
    }
    th.text-right { text-align: right; }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
      vertical-align: top;
    }
    td.text-right { text-align: right; }
    .item-name { font-weight: 600; color: #0f172a; }
    .item-desc { font-size: 11px; color: #64748b; margin-top: 2px; }
    .custom-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 6px;
    }

    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
      margin-bottom: 30px;
    }
    .totals-box {
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 18px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      color: #475569;
    }
    .totals-row.grand-total {
      border-top: 2px solid #0f172a;
      margin-top: 8px;
      padding-top: 8px;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    .terms-box {
      background: #f8fafc;
      border-left: 3px solid #64748b;
      padding: 12px 16px;
      font-size: 11px;
      color: #475569;
      white-space: pre-line;
      margin-bottom: 36px;
    }

    .sign-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .sign-box {
      border-top: 1px dashed #94a3b8;
      padding-top: 8px;
    }
    .sign-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .sign-field {
      margin-top: 4px;
      font-size: 12px;
      color: #0f172a;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">${data.company.name}</div>
      <div class="brand-tagline">B2B Software & Professional Services</div>
    </div>
    <div class="meta-box">
      <div class="prop-pill">PROPOSAL ${data.proposalNumber}</div>
      <div class="meta-text">Date: ${data.date}</div>
      <div class="meta-text">Valid Until: ${data.validUntil}</div>
    </div>
  </div>

  <div class="parties-grid">
    <div>
      <div class="party-title">PREPARED BY</div>
      <div class="party-name">${data.company.name}</div>
      <div class="party-detail">${data.company.email}</div>
      <div class="party-detail">${data.company.phone}</div>
      <div class="party-detail">${data.company.address}</div>
    </div>
    <div>
      <div class="party-title">PREPARED FOR</div>
      <div class="party-name">${data.client.name}</div>
      ${data.client.company ? `<div class="party-detail"><strong>${data.client.company}</strong></div>` : ''}
      <div class="party-detail">${data.client.email}</div>
      ${data.client.phone ? `<div class="party-detail">${data.client.phone}</div>` : ''}
    </div>
  </div>

  <div class="project-header">
    <div class="project-title">${data.title}</div>
    <p style="color: #475569;">${data.overview}</p>
  </div>

  <div class="section-title">Scope of Work</div>
  <ul class="scope-list">
    ${data.scopeItems.map(item => `<li class="scope-item">${item}</li>`).join('')}
  </ul>

  <div class="section-title">Key Deliverables</div>
  <div class="deliverables-grid">
    ${data.deliverables.map(del => `
      <div class="deliverable-card">
        <div class="deliv-title">${del.title} ${del.quantity ? `(${del.quantity})` : ''}</div>
        <div class="deliv-desc">${del.description}</div>
      </div>
    `).join('')}
  </div>

  ${data.timelineWeeks || (data.milestones && data.milestones.length > 0) ? `
    <div class="section-title">Project Timeline & Milestones</div>
    <p style="color: #475569; margin-bottom: 12px;">Estimated completion schedule: <strong>${data.timelineWeeks ? `${data.timelineWeeks} Weeks` : 'As agreed'}</strong>.</p>
    ${data.milestones && data.milestones.length > 0 ? `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 24px;">
        ${data.milestones.map(m => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px;">
            <div style="font-weight: 700; font-size: 11px; color: #2563eb; text-transform: uppercase;">${m.phase}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Duration: ${m.duration}</div>
            <div style="font-size: 11px; color: #1e293b; margin-top: 4px;">${m.description}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  ` : ''}

  <div class="section-title">Investment & Pricing Breakdown</div>
  <table>
    <thead>
      <tr>
        <th style="width: 45%;">Service / Item</th>
        <th style="width: 15%;">Unit Type</th>
        <th style="width: 10%;" class="text-right">Qty</th>
        <th style="width: 15%;" class="text-right">Rate</th>
        <th style="width: 15%;" class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${data.pricingItems.map(item => `
        <tr>
          <td>
            <div class="item-name">
              ${item.name}
              ${item.isCustom ? `<span class="custom-badge">Custom</span>` : ''}
            </div>
            <div class="item-desc">${item.description}</div>
          </td>
          <td>${item.unitType}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unitRate)}</td>
          <td class="text-right" style="font-weight: 600;">${formatCurrency(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-area">
    <div class="totals-box">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(data.subtotal)}</span>
      </div>
      ${data.discountAmount > 0 ? `
        <div class="totals-row" style="color: #16a34a;">
          <span>Discount</span>
          <span>-${formatCurrency(data.discountAmount)}</span>
        </div>
      ` : ''}
      <div class="totals-row">
        <span>Estimated Tax (${data.taxPercent}%)</span>
        <span>${formatCurrency(data.taxAmount)}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Total Investment</span>
        <span>${formatCurrency(data.totalAmount)}</span>
      </div>
    </div>
  </div>

  <div class="section-title">Terms & Conditions</div>
  <div class="terms-box">${data.termsAndConditions}</div>

  <div class="sign-section">
    <div>
      <div class="sign-box">
        <div class="sign-label">Authorized Signature (${data.company.name})</div>
        <div class="sign-field" style="margin-top: 24px;">Date: ________________________</div>
      </div>
    </div>
    <div>
      <div class="sign-box">
        <div class="sign-label">Client Acceptance (${data.client.company || data.client.name})</div>
        <div class="sign-field" style="margin-top: 24px;">Date: ________________________</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
