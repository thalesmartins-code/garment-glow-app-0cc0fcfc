import { useCallback, useState } from "react";
import { useGoogleSheetsSync } from "@/hooks/useGoogleSheetsSync";
import { useSalesData } from "@/contexts/SalesDataContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useSalesDataDB } from "@/hooks/useSalesDataDB";
import { useToast } from "@/hooks/use-toast";
import { generateTargetId } from "@/types/settings";

export function useSyncAndImport() {
  const { sync, toImportedSales, loading: syncLoading } = useGoogleSheetsSync();
  const { appendSales } = useSalesData();
  const { saveTarget } = useSettings();
  const { saveSalesToDB, loadSalesFromDB } = useSalesDataDB();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  // Load persisted data from Supabase into context
  const loadFromDB = useCallback(async () => {
    try {
      const sales = await loadSalesFromDB();
      if (sales.length > 0) {
        const bySeller = sales.reduce((acc, sale) => {
          if (!acc[sale.sellerId]) acc[sale.sellerId] = [];
          acc[sale.sellerId].push(sale);
          return acc;
        }, {} as Record<string, typeof sales>);

        for (const [sellerId, sellerSales] of Object.entries(bySeller)) {
          appendSales(sellerSales, sellerId);
        }
      }
      return sales.length;
    } catch {
      console.error("Erro ao carregar dados do banco");
      return 0;
    }
  }, [loadSalesFromDB, appendSales]);

  const syncAndImport = useCallback(async (spreadsheetId: string, sellerId: string) => {
    setIsSyncing(true);
    try {
      const result = await sync(spreadsheetId, sellerId);
      if (result.success && result.sales.length > 0) {
        const importedSales = toImportedSales(result.sales);

        const bySeller = importedSales.reduce((acc, sale) => {
          if (!acc[sale.sellerId]) acc[sale.sellerId] = [];
          acc[sale.sellerId].push(sale);
          return acc;
        }, {} as Record<string, typeof importedSales>);

        let totalImported = 0;
        for (const [sellerId, sales] of Object.entries(bySeller)) {
          appendSales(sales, sellerId);
          totalImported += sales.length;

          // Auto-populate PMT and Meta in SettingsContext
          const byMonth = sales.reduce((acc, s) => {
            if (!acc[s.mes]) acc[s.mes] = [];
            acc[s.mes].push(s);
            return acc;
          }, {} as Record<number, typeof sales>);

          for (const [monthStr, monthSales] of Object.entries(byMonth)) {
            const month = parseInt(monthStr);
            const year = monthSales[0].ano;
            const marketplaceId = "total";
            const id = generateTargetId(sellerId, marketplaceId, year, month);

            const totalMeta = monthSales.reduce((sum, s) => sum + (s.metaVendas || 0), 0);
            const pmtDistribution = monthSales
              .filter(s => s.dia >= 1 && s.dia <= 31)
              .map(s => ({ day: s.dia, pmt: s.pmt || 0 }));

            if (totalMeta > 0 || pmtDistribution.some(d => d.pmt > 0)) {
              saveTarget({
                id,
                sellerId,
                marketplaceId,
                year,
                month,
                targetValue: totalMeta,
                pmtDistribution,
              });
            }
          }
        }

        // Save to Supabase DB
        try {
          await saveSalesToDB(importedSales);
        } catch (e) {
          console.error("Erro ao persistir dados no banco:", e);
        }

        toast({
          title: "Dados sincronizados!",
          description: `${totalImported} registros importados de ${Object.keys(bySeller).length} seller(s).`,
        });
        return totalImported;
      } else {
        toast({
          title: "Nenhum dado encontrado",
          description: "A planilha não contém dados de vendas para sincronizar.",
          variant: "destructive",
        });
        return 0;
      }
    } catch {
      return 0;
    } finally {
      setIsSyncing(false);
    }
  }, [sync, toImportedSales, appendSales, saveTarget, saveSalesToDB, toast]);

  return { syncAndImport, loadFromDB, isSyncing: isSyncing || syncLoading };
}
