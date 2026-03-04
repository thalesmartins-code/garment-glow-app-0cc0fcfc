import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImportedSale } from "@/types/import";
import { supabase } from "@/integrations/supabase/client";

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
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const { toast } = useToast();

  const sync = useCallback(
    async (
      spreadsheetId: string,
      sellerId: string,
      year?: number,
      tabs?: string[]
    ): Promise<SyncResponse> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("google-sheets-sync", {
          body: { spreadsheetId, sellerId, year, tabs },
        });

        if (error) {
          toast({
            title: "Erro na sincronização",
            description: error.message || "Erro ao conectar com Google Sheets",
            variant: "destructive",
          });
          return { success: false, sales: [], totalRecords: 0, tabs: {}, mode: "sync" };
        }

        if (!data.success) {
          toast({
            title: "Erro na sincronização",
            description: data.error || "Erro desconhecido",
            variant: "destructive",
          });
          return { success: false, sales: [], totalRecords: 0, tabs: {}, mode: "sync" };
        }

        setSyncResult(data);
        return data;
      } catch (err) {
        toast({
          title: "Erro na sincronização",
          description: (err as Error).message,
          variant: "destructive",
        });
        return { success: false, sales: [], totalRecords: 0, tabs: {}, mode: "sync" };
      } finally {
        setLoading(false);
      }
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

  return { loading, syncResult, sync, toImportedSales, ALL_TABS };
}
