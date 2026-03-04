import { useState, useCallback, useMemo } from "react";
import { 
  DashboardData, 
  PeriodFilter,
  DashboardSummary
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useSellerSalesData } from "@/hooks/useSellerSalesData";

interface UseDashboardDataOptions {
  autoRefreshInterval?: number; // in milliseconds, 0 to disable
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  summary: DashboardSummary | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  selectedPeriod: PeriodFilter;
  selectedMarketplace: string | "all";
  selectedYear: number;
  selectedMonth: number;
  setSelectedPeriod: (period: PeriodFilter) => void;
  setSelectedMarketplace: (marketplace: string | "all") => void;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  refresh: () => void;
  hasData: boolean;
}

export function useDashboardData(
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn {
  const { toast } = useToast();
  const { getMarketplaceSummary, hasAnyData, getAvailableYears, getAvailableMonths } = useSellerSalesData();

  const currentDate = new Date();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("month");
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | "all">("all");
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get marketplace summary data
  const marketplaceSummary = useMemo(() => {
    return getMarketplaceSummary(selectedYear, selectedMonth);
  }, [getMarketplaceSummary, selectedYear, selectedMonth]);

  // Filter by marketplace if selected
  const filteredMarketplaces = useMemo(() => {
    if (selectedMarketplace === "all") {
      return marketplaceSummary;
    }
    return marketplaceSummary.filter((mp) => mp.id === selectedMarketplace);
  }, [marketplaceSummary, selectedMarketplace]);

  // Calculate summary from filtered data
  const summary: DashboardSummary | null = useMemo(() => {
    if (filteredMarketplaces.length === 0) {
      return null;
    }

    const totalReceita = filteredMarketplaces.reduce((sum, mp) => sum + mp.vendaTotal, 0);
    const metaGeral = filteredMarketplaces.reduce((sum, mp) => sum + mp.meta, 0);
    const vendaAnoAnteriorTotal = filteredMarketplaces.reduce((sum, mp) => sum + mp.vendaAnoAnterior, 0);

    return {
      totalVendas: 0, // We don't have quantity data from imports
      totalReceita,
      pmtGeral: 0, // No ticket médio without quantity
      metaGeral,
      metaPercentage: metaGeral > 0 ? (totalReceita / metaGeral) * 100 : 0,
      yoyGrowthGeral: vendaAnoAnteriorTotal > 0 ? ((totalReceita - vendaAnoAnteriorTotal) / vendaAnoAnteriorTotal) * 100 : 0,
      ticketMedioYoY: 0,
      conversionRate: 0,
    };
  }, [filteredMarketplaces]);

  // Check if there's any data for the period
  const hasData = useMemo(() => {
    return hasAnyData(selectedYear, selectedMonth);
  }, [hasAnyData, selectedYear, selectedMonth]);

  // Build dashboard data object
  const data: DashboardData | null = useMemo(() => {
    if (!summary) return null;

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return {
      summary,
      marketplaces: filteredMarketplaces.map(mp => ({
        ...mp,
        vendas: 0,
        pmt: 0,
        lastYearTotal: mp.vendaAnoAnterior,
      })),
      lastUpdate: new Date().toLocaleString('pt-BR'),
      period: `${monthNames[selectedMonth - 1]} ${selectedYear}`,
    };
  }, [summary, filteredMarketplaces, selectedMonth, selectedYear]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dados atualizados",
        description: "O dashboard foi atualizado com sucesso.",
      });
    }, 500);
  }, [toast]);

  return {
    data,
    summary,
    isLoading: false,
    isRefreshing,
    error: null,
    selectedPeriod,
    selectedMarketplace,
    selectedYear,
    selectedMonth,
    setSelectedPeriod,
    setSelectedMarketplace,
    setSelectedYear,
    setSelectedMonth,
    refresh,
    hasData,
  };
}
