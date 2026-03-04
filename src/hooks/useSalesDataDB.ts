import { useCallback } from "react";
import { ImportedSale } from "@/types/import";
import { supabase } from "@/integrations/supabase/client";

export function useSalesDataDB() {
  const saveSalesToDB = useCallback(async (sales: ImportedSale[]) => {
    if (sales.length === 0) return;

    const rows = sales.map((s) => ({
      seller_id: s.sellerId,
      marketplace: s.marketplace,
      ano: s.ano,
      mes: s.mes,
      dia: s.dia,
      venda_total: s.vendaTotal,
      venda_aprovada_real: s.vendaAprovadaReal ?? 0,
      qtd_vendas: s.qtdVendas ?? 0,
      pmt: s.pmt ?? 0,
      meta_vendas: s.metaVendas ?? 0,
      venda_ano_anterior: s.vendaAnoAnterior ?? 0,
    }));

    // Upsert in batches of 500
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabase
        .from("sales_data")
        .upsert(batch, {
          onConflict: "seller_id,marketplace,ano,mes,dia",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error("Erro ao salvar dados no Supabase:", error);
        throw error;
      }
    }
  }, []);

  const loadSalesFromDB = useCallback(async (sellerId?: string): Promise<ImportedSale[]> => {
    let query = supabase.from("sales_data").select("*");

    if (sellerId) {
      query = query.eq("seller_id", sellerId);
    }

    // Handle pagination for large datasets (Supabase limit is 1000)
    const allData: ImportedSale[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await query.range(from, from + pageSize - 1);

      if (error) {
        console.error("Erro ao carregar dados do Supabase:", error);
        throw error;
      }

      if (!data || data.length === 0) break;

      const mapped = data.map((row) => ({
        sellerId: row.seller_id,
        marketplace: row.marketplace,
        ano: row.ano,
        mes: row.mes,
        dia: row.dia,
        vendaTotal: Number(row.venda_total),
        vendaAprovadaReal: row.venda_aprovada_real ? Number(row.venda_aprovada_real) : undefined,
        qtdVendas: row.qtd_vendas ? Number(row.qtd_vendas) : undefined,
        pmt: row.pmt ? Number(row.pmt) : undefined,
        metaVendas: row.meta_vendas ? Number(row.meta_vendas) : undefined,
        vendaAnoAnterior: row.venda_ano_anterior ? Number(row.venda_ano_anterior) : undefined,
      }));

      allData.push(...mapped);

      if (data.length < pageSize) break;
      from += pageSize;
    }

    return allData;
  }, []);

  return { saveSalesToDB, loadSalesFromDB };
}
