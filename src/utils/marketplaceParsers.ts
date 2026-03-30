export type MarketplaceType = "shopee" | "amazon" | "magalu";

export interface ParsedImportRow {
  date: string;        // yyyy-mm-dd
  hour: number | null; // 0-23 or null
  revenue: number;
  revenueWithoutDiscounts: number;
  orders: number;
  avgOrderValue: number;
  clicks: number;
  visitors: number;
  conversionRate: number;
  cancelledOrders: number;
  cancelledRevenue: number;
  returnedOrders: number;
  returnedRevenue: number;
  buyers: number;
  newBuyers: number;
  existingBuyers: number;
  potentialBuyers: number;
  repeatPurchaseRate: number;
  raw: Record<string, string>;
}

export function parseMarketplaceFile(
  marketplace: MarketplaceType,
  content: string | ArrayBuffer,
  fileType: "csv" | "excel"
): ParsedImportRow[] {
  if (marketplace === "shopee") {
    if (fileType === "excel") {
      throw new Error("Shopee: use o arquivo CSV exportado da plataforma.");
    }
    return parseShopeeCSV(content as string);
  }
  throw new Error(`Parser para ${marketplace} ainda não implementado. Envie um arquivo de exemplo.`);
}

// ─── Shopee CSV ────────────────────────────────────────────────

function parseShopeeCSV(content: string): ParsedImportRow[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  // Find second header row (line 4 = index 3 in the array after filtering)
  // The structure is: header, summary, empty, header, data...
  // After filtering empty lines: header(0), summary(1), header(2), data(3+)

  let dataStartIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith("Data,")) {
      dataStartIdx = i + 1;
      break;
    }
  }

  if (dataStartIdx === -1 || dataStartIdx >= lines.length) {
    throw new Error("Formato Shopee não reconhecido. Certifique-se de exportar o relatório 'Produto Pago'.");
  }

  const rows: ParsedImportRow[] = [];

  for (let i = dataStartIdx; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.length < 12 || !values[0]?.trim()) continue;

    const rawDate = values[0].trim();
    const { date, hour } = parseShopeeDate(rawDate);

    rows.push({
      date,
      hour,
      revenue: parseBRNumber(values[1]),
      revenueWithoutDiscounts: parseBRNumber(values[2]),
      orders: parseInt(values[3]) || 0,
      avgOrderValue: parseBRNumber(values[4]),
      clicks: parseInt(values[5]) || 0,
      visitors: parseInt(values[6]) || 0,
      conversionRate: parsePercent(values[7]),
      cancelledOrders: parseInt(values[8]) || 0,
      cancelledRevenue: parseBRNumber(values[9]),
      returnedOrders: parseInt(values[10]) || 0,
      returnedRevenue: parseBRNumber(values[11]),
      buyers: parseInt(values[12]) || 0,
      newBuyers: parseInt(values[13]) || 0,
      existingBuyers: parseInt(values[14]) || 0,
      potentialBuyers: parseInt(values[15]) || 0,
      repeatPurchaseRate: parsePercent(values[16]),
      raw: { _raw: lines[i] },
    });
  }

  if (rows.length === 0) throw new Error("Nenhuma linha válida encontrada no arquivo Shopee.");
  return rows;
}

/** Parse "dd/mm/yyyy" or "dd/mm/yyyy HH:mm" into { date: "yyyy-mm-dd", hour } */
function parseShopeeDate(raw: string): { date: string; hour: number | null } {
  const parts = raw.split(" ");
  const [d, m, y] = parts[0].split("/");
  const date = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  let hour: number | null = null;
  if (parts[1]) {
    hour = parseInt(parts[1].split(":")[0]) ?? null;
  }
  return { date, hour };
}

/** Parse Brazilian number: "10.227,04" → 10227.04 */
function parseBRNumber(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/"/g, "").replace(/[^\d.,-]/g, "");
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return parseFloat(cleaned) || 0;
}

/** Parse "4,57%" → 4.57 (keeps as percentage, not decimal) */
function parsePercent(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/"/g, "").replace("%", "").trim();
  return parseBRNumber(cleaned);
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
