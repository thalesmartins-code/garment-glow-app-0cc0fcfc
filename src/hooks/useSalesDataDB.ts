import { useCallback } from "react";
import { ImportedSale } from "@/types/import";

const DB_STORAGE_KEY = "sales_data_db";

export function useSalesDataDB() {
  // Save sales data to localStorage (fallback for no Supabase)
  const saveSalesToDB = useCallback(async (sales: ImportedSale[]) => {
    if (sales.length === 0) return;
    try {
      const existing = localStorage.getItem(DB_STORAGE_KEY);
      const existingData: ImportedSale[] = existing ? JSON.parse(existing) : [];
      
      // Merge/upsert
      const merged = [...existingData];
      sales.forEach((s) => {
        const idx = merged.findIndex(
          (e) =>
            e.sellerId === s.sellerId &&
            e.marketplace === s.marketplace &&
            e.ano === s.ano &&
            e.mes === s.mes &&
            e.dia === s.dia
        );
        if (idx >= 0) {
          merged[idx] = s;
        } else {
          merged.push(s);
        }
      });
      
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }, []);

  // Load sales data from localStorage
  const loadSalesFromDB = useCallback(async (sellerId?: string): Promise<ImportedSale[]> => {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (!stored) return [];
      
      const data: ImportedSale[] = JSON.parse(stored);
      if (sellerId) {
        return data.filter((s) => s.sellerId === sellerId);
      }
      return data;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      return [];
    }
  }, []);

  return { saveSalesToDB, loadSalesFromDB };
}
