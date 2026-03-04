import { ImportedSale, ImportResult, ImportError, VALID_MARKETPLACES } from "@/types/import";
import * as XLSX from "xlsx";

function normalizeMarketplace(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  
  const marketplaceMap: Record<string, string> = {
    "mercado livre": "Mercado Livre",
    "mercadolivre": "Mercado Livre",
    "ml": "Mercado Livre",
    "amazon": "Amazon",
    "amz": "Amazon",
    "shopee": "Shopee",
    "magalu": "Magalu",
    "magazine luiza": "Magalu",
    "dafiti": "Dafiti",
    "netshoes": "Netshoes",
  };

  return marketplaceMap[normalized] || null;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function parseNumber(value: string | number): number {
  if (typeof value === "number") return value;
  // Handle both comma and period as decimal separator
  const normalized = value.trim().replace(",", ".");
  return parseFloat(normalized);
}

interface RawRow {
  marketplace: string;
  ano: string | number;
  mes: string | number;
  dia: string | number;
  venda_total: string | number;
}

function validateAndParseRows(rows: RawRow[]): ImportResult {
  const errors: ImportError[] = [];
  const data: ImportedSale[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNumber = i + 2; // +2 because row 1 is header, and we're 0-indexed

    // Validate marketplace
    const marketplaceRaw = String(row.marketplace || "");
    const marketplace = normalizeMarketplace(marketplaceRaw);
    if (!marketplace) {
      errors.push({
        line: lineNumber,
        message: `Marketplace inválido: "${marketplaceRaw}". Valores aceitos: ${VALID_MARKETPLACES.join(", ")}`,
      });
      continue;
    }

    // Validate year
    const ano = typeof row.ano === "number" ? row.ano : parseInt(String(row.ano), 10);
    if (isNaN(ano) || ano < 2020 || ano > 2030) {
      errors.push({
        line: lineNumber,
        message: `Ano inválido: "${row.ano}". Deve estar entre 2020 e 2030`,
      });
      continue;
    }

    // Validate month
    const mes = typeof row.mes === "number" ? row.mes : parseInt(String(row.mes), 10);
    if (isNaN(mes) || mes < 1 || mes > 12) {
      errors.push({
        line: lineNumber,
        message: `Mês inválido: "${row.mes}". Deve estar entre 1 e 12`,
      });
      continue;
    }

    // Validate day
    const dia = typeof row.dia === "number" ? row.dia : parseInt(String(row.dia), 10);
    if (isNaN(dia) || dia < 1 || dia > 31) {
      errors.push({
        line: lineNumber,
        message: `Dia inválido: "${row.dia}". Deve estar entre 1 e 31`,
      });
      continue;
    }

    // Validate date combination
    if (!isValidDate(ano, mes, dia)) {
      errors.push({
        line: lineNumber,
        message: `Data inválida: ${dia}/${mes}/${ano}`,
      });
      continue;
    }

    // Validate sale value
    const vendaTotal = parseNumber(row.venda_total);
    if (isNaN(vendaTotal) || vendaTotal < 0) {
      errors.push({
        line: lineNumber,
        message: `Valor de venda inválido: "${row.venda_total}". Deve ser um número positivo`,
      });
      continue;
    }

    data.push({
      sellerId: "", // Will be set by the Import page
      marketplace,
      ano,
      mes,
      dia,
      vendaTotal,
    });
  }

  return {
    success: errors.length === 0,
    totalRows: rows.length,
    validRows: data.length,
    errors,
    data,
  };
}

export function parseCSV(content: string): ImportResult {
  const lines = content.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      errors: [{ line: 1, message: "Arquivo vazio ou sem dados" }],
      data: [],
    };
  }

  // Detect separator (semicolon or comma)
  const header = lines[0];
  const separator = header.includes(";") ? ";" : ",";

  // Validate header
  const headerColumns = header.toLowerCase().split(separator).map(col => col.trim());
  const requiredColumns = ["marketplace", "ano", "mes", "dia", "venda_total"];
  const missingColumns = requiredColumns.filter(col => !headerColumns.includes(col));

  if (missingColumns.length > 0) {
    return {
      success: false,
      totalRows: lines.length - 1,
      validRows: 0,
      errors: [{ line: 1, message: `Colunas obrigatórias ausentes: ${missingColumns.join(", ")}` }],
      data: [],
    };
  }

  // Get column indices
  const marketplaceIdx = headerColumns.indexOf("marketplace");
  const anoIdx = headerColumns.indexOf("ano");
  const mesIdx = headerColumns.indexOf("mes");
  const diaIdx = headerColumns.indexOf("dia");
  const vendaTotalIdx = headerColumns.indexOf("venda_total");

  // Parse data rows into RawRow format
  const rows: RawRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const columns = line.split(separator).map(col => col.trim());
    rows.push({
      marketplace: columns[marketplaceIdx] || "",
      ano: columns[anoIdx] || "",
      mes: columns[mesIdx] || "",
      dia: columns[diaIdx] || "",
      venda_total: columns[vendaTotalIdx] || "",
    });
  }

  return validateAndParseRows(rows);
}

export function parseExcel(buffer: ArrayBuffer): ImportResult {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { 
      raw: true,
      defval: "" 
    });

    if (jsonData.length === 0) {
      return {
        success: false,
        totalRows: 0,
        validRows: 0,
        errors: [{ line: 1, message: "Arquivo vazio ou sem dados" }],
        data: [],
      };
    }

    // Normalize column names (lowercase, trim)
    const normalizedData: RawRow[] = jsonData.map((row) => {
      const normalizedRow: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        normalizedRow[key.toLowerCase().trim()] = row[key];
      });
      return {
        marketplace: String(normalizedRow.marketplace || ""),
        ano: normalizedRow.ano as string | number,
        mes: normalizedRow.mes as string | number,
        dia: normalizedRow.dia as string | number,
        venda_total: normalizedRow.venda_total as string | number,
      };
    });

    // Validate required columns
    const firstRow = normalizedData[0];
    const requiredColumns = ["marketplace", "ano", "mes", "dia", "venda_total"];
    const availableColumns = Object.keys(jsonData[0]).map(k => k.toLowerCase().trim());
    const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));

    if (missingColumns.length > 0) {
      return {
        success: false,
        totalRows: jsonData.length,
        validRows: 0,
        errors: [{ line: 1, message: `Colunas obrigatórias ausentes: ${missingColumns.join(", ")}` }],
        data: [],
      };
    }

    return validateAndParseRows(normalizedData);
  } catch (error) {
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      errors: [{ line: 1, message: `Erro ao ler arquivo Excel: ${error instanceof Error ? error.message : "Erro desconhecido"}` }],
      data: [],
    };
  }
}

export function generateCSVTemplate(): string {
  const header = "marketplace;ano;mes;dia;venda_total";
  const exampleRows = [
    "Mercado Livre;2025;1;1;15678.50",
    "Mercado Livre;2025;1;2;18234.00",
    "Amazon;2025;1;1;12450.75",
    "Amazon;2025;1;2;14567.80",
    "Shopee;2025;1;1;8932.25",
  ];

  return [header, ...exampleRows].join("\n");
}

export function generateExcelTemplate(): void {
  const data = [
    { marketplace: "Mercado Livre", ano: 2025, mes: 1, dia: 1, venda_total: 15678.50 },
    { marketplace: "Mercado Livre", ano: 2025, mes: 1, dia: 2, venda_total: 18234.00 },
    { marketplace: "Amazon", ano: 2025, mes: 1, dia: 1, venda_total: 12450.75 },
    { marketplace: "Amazon", ano: 2025, mes: 1, dia: 2, venda_total: 14567.80 },
    { marketplace: "Shopee", ano: 2025, mes: 1, dia: 1, venda_total: 8932.25 },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");

  // Set column widths
  worksheet["!cols"] = [
    { wch: 15 }, // marketplace
    { wch: 8 },  // ano
    { wch: 6 },  // mes
    { wch: 6 },  // dia
    { wch: 12 }, // venda_total
  ];

  XLSX.writeFile(workbook, "template_vendas.xlsx");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getFileType(filename: string): "csv" | "excel" | "unknown" {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "csv") return "csv";
  if (ext === "xlsx" || ext === "xls") return "excel";
  return "unknown";
}
