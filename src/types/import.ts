export interface ImportedSale {
  sellerId: string;
  marketplace: string;
  ano: number;
  mes: number;
  dia: number;
  vendaTotal: number;
  vendaAprovadaReal?: number;
  qtdVendas?: number;
  pmt?: number;
  metaVendas?: number;
  vendaAnoAnterior?: number;
}

export interface MarketplaceQuantity {
  sellerId: string;
  marketplace: string;
  ano: number;
  mes: number;
  qtdVendas: number;
}

export interface ImportError {
  line: number;
  message: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
  data: ImportedSale[];
}

export const VALID_MARKETPLACES = [
  "Mercado Livre",
  "Amazon",
  "Shopee",
  "Magalu",
  "Dafiti",
  "Netshoes",
  "Total",
] as const;

export type ValidMarketplace = typeof VALID_MARKETPLACES[number];
