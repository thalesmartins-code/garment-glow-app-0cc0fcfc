export type MarketplaceType = "shopee" | "amazon" | "magalu";

export interface ParsedImportRow {
  date: string;
  orderId?: string;
  revenue: number;
  quantity: number;
  productTitle?: string;
  sku?: string;
  raw: Record<string, string>;
}

/**
 * Placeholder parser — será atualizado após análise dos arquivos de exemplo.
 * Por enquanto faz parse genérico de CSV/Excel assumindo colunas comuns.
 */
export function parseMarketplaceFile(
  marketplace: MarketplaceType,
  content: string | ArrayBuffer,
  fileType: "csv" | "excel"
): ParsedImportRow[] {
  if (fileType === "excel") {
    return parseExcel(marketplace, content as ArrayBuffer);
  }
  return parseCsv(marketplace, content as string);
}

function parseCsv(marketplace: MarketplaceType, content: string): ParsedImportRow[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error("Arquivo vazio ou sem dados.");

  const headers = splitCsvLine(lines[0]);
  const rows: ParsedImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => { raw[h.trim()] = values[idx]?.trim() || ""; });

    const mapped = mapRow(marketplace, raw);
    if (mapped) rows.push(mapped);
  }

  if (rows.length === 0) throw new Error("Nenhuma linha válida encontrada. Verifique se o formato do arquivo corresponde ao marketplace selecionado.");
  return rows;
}

function parseExcel(marketplace: MarketplaceType, buffer: ArrayBuffer): ParsedImportRow[] {
  // Dynamic import would be needed for xlsx in browser
  // For now, we use the xlsx library that's already installed
  const XLSX = require("xlsx");
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (!jsonData.length) throw new Error("Planilha vazia ou sem dados.");

  const rows: ParsedImportRow[] = [];
  for (const raw of jsonData) {
    const stringRaw: Record<string, string> = {};
    Object.entries(raw).forEach(([k, v]) => { stringRaw[k] = String(v); });
    const mapped = mapRow(marketplace, stringRaw);
    if (mapped) rows.push(mapped);
  }

  if (rows.length === 0) throw new Error("Nenhuma linha válida encontrada.");
  return rows;
}

function mapRow(marketplace: MarketplaceType, raw: Record<string, string>): ParsedImportRow | null {
  // Placeholder: tenta encontrar colunas comuns por nome
  // Será substituído por parsers específicos após receber arquivos de exemplo
  const keys = Object.keys(raw);

  const findCol = (patterns: string[]) =>
    keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));

  const dateCol = findCol(["data", "date", "fecha", "created"]);
  const orderCol = findCol(["pedido", "order", "nº do pedido", "order id"]);
  const revenueCol = findCol(["receita", "revenue", "total", "valor", "amount", "price"]);
  const qtyCol = findCol(["quantidade", "qty", "quantity", "qtd", "units"]);
  const productCol = findCol(["produto", "product", "title", "item", "nome"]);
  const skuCol = findCol(["sku", "código"]);

  const date = dateCol ? raw[dateCol] : "";
  const revenue = revenueCol ? parseNumber(raw[revenueCol]) : 0;
  const quantity = qtyCol ? parseInt(raw[qtyCol]) || 1 : 1;

  if (!date && !revenue) return null;

  return {
    date,
    orderId: orderCol ? raw[orderCol] : undefined,
    revenue,
    quantity,
    productTitle: productCol ? raw[productCol] : undefined,
    sku: skuCol ? raw[skuCol] : undefined,
    raw,
  };
}

function parseNumber(val: string): number {
  if (!val) return 0;
  // Handle Brazilian format: 1.234,56
  const cleaned = val.replace(/[^\d.,-]/g, "");
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return parseFloat(cleaned) || 0;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "," || char === ";") && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
