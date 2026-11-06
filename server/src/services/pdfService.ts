import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { ProposalTemplateData, renderModernMinimalist } from '../templates/modernMinimalist.js';
import { renderCorporateExecutive } from '../templates/corporateExecutive.js';
import { renderCreativeStudio } from '../templates/creativeStudio.js';

export class PdfService {
  private static uploadsDir = path.join(process.cwd(), 'uploads', 'proposals');

  static ensureDirectoryExists() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  static renderHtml(templateId: string, data: ProposalTemplateData): string {
    switch (templateId) {
      case 'corporate-executive':
        return renderCorporateExecutive(data);
      case 'creative-studio':
        return renderCreativeStudio(data);
      case 'modern-minimalist':
      default:
        return renderModernMinimalist(data);
    }
  }

  static async generatePdf(templateId: string, data: ProposalTemplateData): Promise<{ buffer: Buffer; filePath: string }> {
    this.ensureDirectoryExists();
    const html = this.renderHtml(templateId, data);
    const fileName = `${data.proposalNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    let browser;
    try {
      const executablePath = process.env.CHROME_BIN ||
        (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : (fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
            ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
            : undefined));

      browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      });

      fs.writeFileSync(filePath, pdfBuffer);
      return { buffer: Buffer.from(pdfBuffer), filePath };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
