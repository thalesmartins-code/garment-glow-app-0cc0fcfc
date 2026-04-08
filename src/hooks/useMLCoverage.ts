import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";

/** Number of days used both as the sales lookback window and coverage horizon */
export type CoveragePeriod = 7 | 15 | 30;
export type CoverageClass = "ruptura" | "critico" | "alerta" | "ok" | "sem_giro";

export interface CoverageData {
  avg_daily_sales: number;
  coverage_days: number | null; // null = sem giro
  coverage_class: CoverageClass;
  total_sold: number;
}

export interface CoverageStats {
  avg_coverage: number | null;
  ruptura: number;
  critico: number;
  alerta: number;
  sem_giro: number;
}

interface InventoryItem {
  id: string;
  available_quantity: number;
}

export const COVERAGE_PERIODS: { label: string; value: CoveragePeriod }[] = [
  { label: "7 dias", value: 7 },
  { label: "15 dias", value: 15 },
  { label: "30 dias", value: 30 },
];

export const COVERAGE_CLASS_LABELS: Record<CoverageClass, string> = {
  ruptura: "Ruptura",
  critico: "Crítico",
  alerta: "Alerta",
  ok: "OK",
  sem_giro: "Sem giro",
};

/**
 * Thresholds are relative to the chosen period N:
 *   critico  → 0 < coverage < N × 0.25   (less than 25% of horizon covered)
 *   alerta   → N × 0.25 ≤ coverage < N   (partially covered)
 *   ok       → coverage ≥ N              (full horizon covered)
 */
function classifyDays(coverage_days: number, period: CoveragePeriod): CoverageClass {
  if (coverage_days < Math.ceil(period * 0.25)) return "critico";
  if (coverage_days < period) return "alerta";
  return "ok";
}

export function useMLCoverage(items: InventoryItem[], period: CoveragePeriod) {
  const { user } = useAuth();
  const [rawData, setRawData] = useState<{ item_id: string; date: string; qty_sold: number }[]>([]);
  const [fetching, setFetching] = useState(false);

  // Fetch last 30 days once — covers all period options (7 / 15 / 30)
  const fetchRaw = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("ml_product_daily_cache")
        .select("item_id, date, qty_sold")
        .eq("user_id", user.id)
        .gte("date", from)
        .order("date", { ascending: false });
      if (!error && data) setRawData(data);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => { fetchRaw(); }, [fetchRaw]);

  // Recompute whenever period, raw data or items change
  const coverageMap = useMemo<Map<string, CoverageData>>(() => {
    if (items.length === 0) return new Map();

    const cutoff = format(subDays(new Date(), period), "yyyy-MM-dd");

    // Aggregate sold qty per item within the selected window
    const soldByItem = new Map<string, number>();
    for (const row of rawData) {
      if (row.date >= cutoff) {
        soldByItem.set(row.item_id, (soldByItem.get(row.item_id) ?? 0) + row.qty_sold);
      }
    }

    const map = new Map<string, CoverageData>();

    for (const item of items) {
      const total_sold = soldByItem.get(item.id) ?? 0;
      const avg_daily_sales = total_sold / period;

      let coverage_days: number | null;
      let coverage_class: CoverageClass;

      if (item.available_quantity === 0) {
        coverage_days = 0;
        coverage_class = "ruptura";
      } else if (avg_daily_sales === 0) {
        coverage_days = null;
        coverage_class = "sem_giro";
      } else {
        coverage_days = Math.floor(item.available_quantity / avg_daily_sales);
        coverage_class = classifyDays(coverage_days, period);
      }

      map.set(item.id, { avg_daily_sales, coverage_days, coverage_class, total_sold });
    }

    return map;
  }, [rawData, items, period]);

  const stats = useMemo<CoverageStats>(() => {
    const all = [...coverageMap.values()];
    const withDays = all.filter(v => v.coverage_days !== null && v.coverage_days > 0);
    return {
      avg_coverage:
        withDays.length > 0
          ? Math.round(withDays.reduce((s, v) => s + v.coverage_days!, 0) / withDays.length)
          : null,
      ruptura: all.filter(v => v.coverage_class === "ruptura").length,
      critico: all.filter(v => v.coverage_class === "critico").length,
      alerta: all.filter(v => v.coverage_class === "alerta").length,
      sem_giro: all.filter(v => v.coverage_class === "sem_giro").length,
    };
  }, [coverageMap]);

  return {
    coverageMap,
    stats,
    loading: fetching && rawData.length === 0,
    refresh: fetchRaw,
  };
}
