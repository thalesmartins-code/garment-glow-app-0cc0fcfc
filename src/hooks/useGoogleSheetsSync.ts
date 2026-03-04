import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImportedSale } from "@/types/import";

interface ParsedSale {
  sellerId: string;
  marketplace: string;
  ano: number;
  mes: number;
  dia: number;
  pmt: number;
  metaVendas: number;
  vendaTotal: number;
  vendaAprovadaReal: number;
  vendaAnoAnterior: number;
}

interface TabResult {
  month: number;
  recordCount: number;
  error?: string;
}

interface SyncResponse {
  success: boolean;
  sales: ParsedSale[];
  totalRecords: number;
  tabs: Record<string, TabResult>;
  mode: string;
}

interface InspectResponse {
  success: boolean;
  data: Record<string, unknown>;
  mode: string;
}

const ALL_TABS = [
  "DIARIZAÇÃO JANEIRO",
  "DIARIZAÇÃO FEVEREIRO",
  "DIARIZAÇÃO MARÇO",
  "DIARIZAÇÃO ABRIL",
  "DIARIZAÇÃO MAIO",
  "DIARIZAÇÃO JUNHO",
  "DIARIZAÇÃO JULHO",
  "DIARIZAÇÃO AGOSTO",
  "DIARIZAÇÃO SETEMBRO",
  "DIARIZAÇÃO OUTUBRO",
  "DIARIZAÇÃO NOVEMBRO",
  "DIARIZAÇÃO DEZEMBRO",
];

export function useGoogleSheetsSync() {
  const [loading, setLoading] = useState(false);
  const [inspectResult, setInspectResult] = useState<InspectResponse | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const { toast } = useToast();

  const inspect = useCallback(
    async (_year?: number, _tabs?: string[]) => {
      toast({
        title: "Google Sheets não configurado",
        description: "Configure o backend (Lovable Cloud) para usar a sincronização com Google Sheets.",
        variant: "destructive",
      });
      return null;
    },
    [toast]
  );

  const sync = useCallback(
    async (_year?: number, _tabs?: string[]): Promise<SyncResponse> => {
      toast({
        title: "Google Sheets não configurado",
        description: "Configure o backend (Lovable Cloud) para usar a sincronização com Google Sheets.",
        variant: "destructive",
      });
      return { success: false, sales: [], totalRecords: 0, tabs: {}, mode: "sync" };
    },
    [toast]
  );

  const toImportedSales = useCallback((sales: ParsedSale[]): ImportedSale[] => {
    return sales.map((s) => ({
      sellerId: s.sellerId,
      marketplace: s.marketplace,
      ano: s.ano,
      mes: s.mes,
      dia: s.dia,
      vendaTotal: s.vendaTotal,
      vendaAprovadaReal: s.vendaAprovadaReal,
      pmt: s.pmt,
      metaVendas: s.metaVendas,
      vendaAnoAnterior: s.vendaAnoAnterior,
    }));
  }, []);

  return { loading, inspectResult, syncResult, inspect, sync, toImportedSales, ALL_TABS };
}
