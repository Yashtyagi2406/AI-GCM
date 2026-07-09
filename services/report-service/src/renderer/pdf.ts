/**
 * PDF report renderer using pdfkit.
 * Generates branded, print-ready cost and usage reports without
 * requiring a headless browser — pure Node.js for CI compatibility.
 */
import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CostBreakdownRow {
  label: string;           // provider, team, model name
  requestCount: number;
  totalTokens: number;
  costUsd: number;
  pct: number;             // % of total spend
}

export interface ReportData {
  orgName: string;
  periodStart: string;    // YYYY-MM-DD
  periodEnd: string;
  totalCostUsd: number;
  totalRequests: number;
  totalTokens: number;
  cacheHitRate: number;   // 0–1
  rows: CostBreakdownRow[];
  generatedAt: string;    // ISO timestamp
}

// ── Renderer ──────────────────────────────────────────────────────────────────

const BRAND_DARK  = '#0F172A';
const BRAND_BLUE  = '#3B82F6';
const BRAND_LIGHT = '#F8FAFC';
const ACCENT      = '#10B981';
const TEXT_MUTED  = '#64748B';

/**
 * renderPDF generates a PDF report and writes it to the provided Writable stream.
 * Returns a Promise that resolves when the PDF is fully written.
 */
export async function renderPDF(data: ReportData, output: Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: `AI Cost Report — ${data.orgName}`,
        Author: 'AI-GCM Platform',
        Subject: `${data.periodStart} to ${data.periodEnd}`,
        CreationDate: new Date(),
      },
    });

    doc.pipe(output);
    output.on('error', reject);
    doc.on('end', resolve);

    const pageWidth = doc.page.width - 120; // account for margins

    // ── Header ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(BRAND_DARK);

    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
       .text('AI Governance & Cost Management', 60, 25, { align: 'left' });

    doc.fontSize(11).font('Helvetica').fillColor('#94A3B8')
       .text('Cost Intelligence Report', 60, 52);

    doc.fillColor('#FFFFFF').fontSize(10)
       .text(`Generated: ${new Date(data.generatedAt).toUTCString()}`, 60, 68, { align: 'right' });

    // ── Title block ───────────────────────────────────────────────────────────
    doc.moveDown(3.5);
    doc.fillColor(BRAND_DARK).fontSize(16).font('Helvetica-Bold')
       .text(data.orgName, { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor(TEXT_MUTED)
       .text(`${data.periodStart}  →  ${data.periodEnd}`, { align: 'center' });

    doc.moveDown(1.5);

    // ── KPI cards row ─────────────────────────────────────────────────────────
    const kpiY = doc.y;
    const kpiW = (pageWidth - 30) / 4;

    const kpis = [
      { label: 'Total Cost', value: `$${data.totalCostUsd.toFixed(2)}`, color: BRAND_BLUE },
      { label: 'Requests',   value: data.totalRequests.toLocaleString(), color: ACCENT },
      { label: 'Tokens',     value: formatTokens(data.totalTokens),     color: '#8B5CF6' },
      { label: 'Cache Hit',  value: `${(data.cacheHitRate * 100).toFixed(1)}%`, color: '#F59E0B' },
    ];

    kpis.forEach((kpi, i) => {
      const x = 60 + i * (kpiW + 10);
      doc.rect(x, kpiY, kpiW, 70).fill(BRAND_LIGHT).stroke('#E2E8F0');
      doc.fillColor(kpi.color).fontSize(20).font('Helvetica-Bold')
         .text(kpi.value, x + 8, kpiY + 12, { width: kpiW - 16, align: 'center' });
      doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica')
         .text(kpi.label, x + 8, kpiY + 44, { width: kpiW - 16, align: 'center' });
    });

    doc.y = kpiY + 80;
    doc.moveDown(1);

    // ── Spend breakdown table ─────────────────────────────────────────────────
    doc.fillColor(BRAND_DARK).fontSize(13).font('Helvetica-Bold')
       .text('Cost Breakdown', 60);
    doc.moveDown(0.4);

    // Table header
    const colX    = [60, 200, 310, 400, 470];
    const headers = ['Name', 'Requests', 'Tokens', 'Cost (USD)', 'Share'];
    const widths  = [140, 110, 90, 70, 65];

    doc.rect(60, doc.y, pageWidth, 22).fill(BRAND_DARK);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(h, colX[i] + 4, doc.y - 17, { width: widths[i], align: i === 0 ? 'left' : 'right' });
    });
    doc.y += 7;

    // Table rows
    data.rows.slice(0, 20).forEach((row, idx) => {
      const rowBg = idx % 2 === 0 ? '#FFFFFF' : BRAND_LIGHT;
      doc.rect(60, doc.y, pageWidth, 20).fill(rowBg);
      doc.fillColor(BRAND_DARK).fontSize(9).font('Helvetica');
      const vals = [
        row.label,
        row.requestCount.toLocaleString(),
        formatTokens(row.totalTokens),
        `$${row.costUsd.toFixed(4)}`,
        `${row.pct.toFixed(1)}%`,
      ];
      vals.forEach((v, i) => {
        doc.text(v, colX[i] + 4, doc.y - 14, { width: widths[i], align: i === 0 ? 'left' : 'right' });
      });
      doc.y += 6;
    });

    // ── ASCII spend bar chart ─────────────────────────────────────────────────
    doc.moveDown(1.5);
    doc.fillColor(BRAND_DARK).fontSize(13).font('Helvetica-Bold')
       .text('Visual Breakdown');
    doc.moveDown(0.4);

    const maxCost = Math.max(...data.rows.map(r => r.costUsd), 0.001);
    const barMaxWidth = pageWidth - 100;

    data.rows.slice(0, 10).forEach(row => {
      const barW = Math.round((row.costUsd / maxCost) * barMaxWidth);
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica')
         .text(row.label.slice(0, 25).padEnd(26), 60, doc.y + 1, { width: 95, continued: false });
      const barY = doc.y - 10;
      doc.rect(158, barY, Math.max(barW, 2), 11).fill(BRAND_BLUE);
      doc.fillColor(BRAND_DARK).fontSize(8)
         .text(`$${row.costUsd.toFixed(2)}`, 162 + barW + 4, barY + 1);
      doc.moveDown(0.6);
    });

    // ── Footer ────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 50;
    doc.rect(0, footerY, doc.page.width, 50).fill(BRAND_DARK);
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
       .text('AI-GCM Platform  •  Confidential  •  Do not distribute externally',
             60, footerY + 18, { align: 'center', width: doc.page.width - 120 });

    doc.end();
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
