// Export utilities for PDF and Excel generation (client-side)

import { formatCurrency } from "./financial-data";

// ============ CSV/Excel Export ============

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  format?: "currency" | "percent" | "text" | "number";
}

export function exportToCSV(
  data: Record<string, any>[],
  columns: ExcelColumn[],
  filename: string
) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel
  const separator = ";"; // Use semicolon for BR locale

  const header = columns.map((c) => c.header).join(separator);
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        if (val === undefined || val === null) return "";
        if (col.format === "currency") return formatCurrency(val).replace("R$", "R$ ");
        if (col.format === "percent") return `${val}%`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(separator)
  );

  const csvContent = BOM + [header, ...rows].join("\n");
  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8");
}

// ============ PDF Export (HTML-to-Print) ============

interface PDFOptions {
  title: string;
  subtitle?: string;
  date?: string;
  orientation?: "portrait" | "landscape";
}

export function exportToPDF(
  tableHtml: string,
  options: PDFOptions
) {
  const { title, subtitle, date = new Date().toLocaleDateString("pt-BR"), orientation = "portrait" } = options;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page { size: A4 ${orientation}; margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; font-size: 11px; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 12px; border-bottom: 2px solid #2856a3; margin-bottom: 16px; }
    .header h1 { font-size: 18px; color: #2856a3; font-weight: 700; }
    .header .subtitle { font-size: 12px; color: #666; margin-top: 2px; }
    .header .meta { text-align: right; font-size: 10px; color: #888; }
    .header .company { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #f0f4fa; color: #2856a3; font-weight: 600; text-align: left; padding: 6px 8px; border-bottom: 2px solid #d0d8e8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e8edf5; font-size: 11px; }
    tr:nth-child(even) { background: #fafbfd; }
    tr.highlight { background: #f0f4fa; font-weight: 600; }
    tr.total { background: #e8eef8; font-weight: 700; border-top: 2px solid #2856a3; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-red { color: #dc2626; }
    .text-green { color: #16a34a; }
    .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 9px; color: #aaa; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${title}</h1>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
    </div>
    <div class="meta">
      <div class="company">FinanceStore</div>
      <div>Emitido em ${date}</div>
    </div>
  </div>
  ${tableHtml}
  <div class="footer">Documento gerado automaticamente pelo sistema FinanceStore · ${date}</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}

// ============ Specific Exporters ============

export function exportDRE(dreData: any[], period: string) {
  const columns: ExcelColumn[] = [
    { header: "Descrição", key: "label" },
    { header: "Mês Atual", key: "currentMonth", format: "currency" },
    { header: "Mês Anterior", key: "previousMonth", format: "currency" },
  ];
  exportToCSV(dreData, columns, `DRE_${period}`);
}

export function exportDREtoPDF(dreData: any[], period: string) {
  let rows = "";
  dreData.forEach((item) => {
    const cls = item.label.startsWith("=") ? "total" : item.bold ? "highlight" : "";
    const indent = item.level === 2 ? "padding-left: 24px;" : "";
    const redCur = item.currentMonth < 0 ? ' class="text-red"' : "";
    const redPrev = item.previousMonth < 0 ? ' class="text-red"' : "";
    rows += `<tr class="${cls}"><td style="${indent}">${item.label}</td><td class="text-right"${redCur}>${formatCurrency(item.currentMonth)}</td><td class="text-right"${redPrev}>${formatCurrency(item.previousMonth)}</td></tr>`;
  });

  const tableHtml = `<table><thead><tr><th>Descrição</th><th class="text-right">Mês Atual</th><th class="text-right">Mês Anterior</th></tr></thead><tbody>${rows}</tbody></table>`;
  exportToPDF(tableHtml, {
    title: "DRE - Demonstrativo de Resultado",
    subtitle: `Regime de Competência · ${period}`,
  });
}

export function exportDFC(dfcData: any[], period: string) {
  const columns: ExcelColumn[] = [
    { header: "Descrição", key: "label" },
    { header: "Mês Atual", key: "currentMonth", format: "currency" },
    { header: "Mês Anterior", key: "previousMonth", format: "currency" },
  ];
  exportToCSV(dfcData, columns, `DFC_${period}`);
}

export function exportDFCtoPDF(dfcData: any[], period: string) {
  let rows = "";
  dfcData
    .filter((d) => !(d.type === "subtotal" && d.currentMonth === 0 && d.previousMonth === 0))
    .forEach((item) => {
      const cls = item.label.includes("SALDO FINAL") ? "total" : item.bold ? "highlight" : "";
      const indent = !item.bold ? "padding-left: 24px;" : "";
      rows += `<tr class="${cls}"><td style="${indent}">${item.label}</td><td class="text-right">${formatCurrency(item.currentMonth)}</td><td class="text-right">${formatCurrency(item.previousMonth)}</td></tr>`;
    });

  const tableHtml = `<table><thead><tr><th>Descrição</th><th class="text-right">Mês Atual</th><th class="text-right">Mês Anterior</th></tr></thead><tbody>${rows}</tbody></table>`;
  exportToPDF(tableHtml, {
    title: "DFC - Fluxo de Caixa",
    subtitle: `Método Direto · ${period}`,
  });
}

export function exportExtrato(clientName: string, receivables: any[]) {
  const columns: ExcelColumn[] = [
    { header: "Descrição", key: "description" },
    { header: "Parcela", key: "parcela" },
    { header: "Vencimento", key: "dueDate" },
    { header: "Valor", key: "amount", format: "currency" },
    { header: "Pago", key: "paidAmount", format: "currency" },
    { header: "Status", key: "statusLabel" },
  ];
  const data = receivables.map((r) => ({
    ...r,
    parcela: `${r.installmentNumber}/${r.totalInstallments}`,
    statusLabel: r.status === "pago" ? "Pago" : r.status === "vencido" ? "Vencido" : r.status === "a_vencer" ? "A Vencer" : "Renegociado",
  }));
  exportToCSV(data, columns, `Extrato_${clientName.replace(/\s/g, "_")}`);
}

// ============ Helpers ============

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
