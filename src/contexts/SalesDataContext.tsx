import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ImportedSale, MarketplaceQuantity } from "@/types/import";

export interface DuplicateInfo {
  marketplace: string;
  count: number;
  records: Array<{ ano: number; mes: number; dia: number }>;
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateCount: number;
  duplicatesByMarketplace: DuplicateInfo[];
  newRecordsOnly: ImportedSale[];
  duplicateRecords: ImportedSale[];
}

interface SalesDataContextType {
  salesData: ImportedSale[];
  importSales: (data: ImportedSale[], sellerId: string) => void;
  appendSales: (data: ImportedSale[], sellerId: string) => void;
  clearSales: (sellerId?: string) => void;
  deleteSale: (sellerId: string, marketplace: string, ano: number, mes: number, dia: number) => void;
  getSalesForMarketplace: (sellerId: string, marketplace: string, year: number, month: number) => ImportedSale[];
  getSalesForDay: (sellerId: string, marketplace: string, year: number, month: number, day: number) => ImportedSale | undefined;
  getAvailableYears: (sellerId: string) => number[];
  getAvailableMonths: (sellerId: string, year: number) => number[];
  getImportedDataForSeller: (sellerId: string) => ImportedSale[];
  hasImportedData: boolean;
  hasImportedDataForSeller: (sellerId: string) => boolean;
  updateSale: (sellerId: string, marketplace: string, ano: number, mes: number, dia: number, vendaTotal: number) => void;
  updateSaleField: (sellerId: string, marketplace: string, ano: number, mes: number, dia: number, field: string, value: number) => void;
  findDuplicates: (sellerId: string, newData: ImportedSale[]) => DuplicateCheckResult;
  // Marketplace quantities
  getMarketplaceQuantity: (sellerId: string, marketplace: string, ano: number, mes: number) => number;
  updateMarketplaceQuantity: (sellerId: string, marketplace: string, ano: number, mes: number, qtdVendas: number) => void;
}

const STORAGE_KEY = "imported_sales_data";
const QUANTITIES_STORAGE_KEY = "marketplace_quantities";

const SalesDataContext = createContext<SalesDataContextType | undefined>(undefined);

export function SalesDataProvider({ children }: { children: React.ReactNode }) {
  const [salesData, setSalesData] = useState<ImportedSale[]>([]);
  const [marketplaceQuantities, setMarketplaceQuantities] = useState<Record<string, number>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSalesData(parsed);
      } catch (error) {
        console.error("Erro ao carregar dados de vendas:", error);
      }
    }
    
    const storedQuantities = localStorage.getItem(QUANTITIES_STORAGE_KEY);
    if (storedQuantities) {
      try {
        const parsed = JSON.parse(storedQuantities);
        setMarketplaceQuantities(parsed);
      } catch (error) {
        console.error("Erro ao carregar quantidades:", error);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (salesData.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salesData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [salesData]);

  // Save quantities to localStorage when they change
  useEffect(() => {
    if (Object.keys(marketplaceQuantities).length > 0) {
      localStorage.setItem(QUANTITIES_STORAGE_KEY, JSON.stringify(marketplaceQuantities));
    }
  }, [marketplaceQuantities]);

  const importSales = useCallback((data: ImportedSale[], sellerId: string) => {
    // Add sellerId to all imported data
    const dataWithSeller = data.map((sale) => ({ ...sale, sellerId }));
    
    setSalesData((prev) => {
      // Remove existing data for this seller, then add new
      const otherSellerData = prev.filter((s) => s.sellerId !== sellerId);
      return [...otherSellerData, ...dataWithSeller];
    });
  }, []);

  const appendSales = useCallback((data: ImportedSale[], sellerId: string) => {
    const dataWithSeller = data.map((sale) => ({ ...sale, sellerId }));
    
    setSalesData((prev) => {
      // Merge new data, replacing duplicates (same seller + marketplace + date)
      const merged = [...prev];
      dataWithSeller.forEach((newSale) => {
        const existingIndex = merged.findIndex(
          (s) =>
            s.sellerId === newSale.sellerId &&
            s.marketplace === newSale.marketplace &&
            s.ano === newSale.ano &&
            s.mes === newSale.mes &&
            s.dia === newSale.dia
        );
        if (existingIndex >= 0) {
          merged[existingIndex] = newSale;
        } else {
          merged.push(newSale);
        }
      });
      return merged;
    });
  }, []);

  const clearSales = useCallback((sellerId?: string) => {
    if (sellerId) {
      setSalesData((prev) => prev.filter((s) => s.sellerId !== sellerId));
    } else {
      setSalesData([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const deleteSale = useCallback(
    (sellerId: string, marketplace: string, ano: number, mes: number, dia: number) => {
      setSalesData((prev) =>
        prev.filter(
          (s) =>
            !(
              s.sellerId === sellerId &&
              s.marketplace === marketplace &&
              s.ano === ano &&
              s.mes === mes &&
              s.dia === dia
            )
        )
      );
    },
    []
  );

  const getSalesForMarketplace = useCallback(
    (sellerId: string, marketplace: string, year: number, month: number) => {
      return salesData.filter(
        (s) => s.sellerId === sellerId && s.marketplace === marketplace && s.ano === year && s.mes === month
      );
    },
    [salesData]
  );

  const getSalesForDay = useCallback(
    (sellerId: string, marketplace: string, year: number, month: number, day: number) => {
      return salesData.find(
        (s) =>
          s.sellerId === sellerId &&
          s.marketplace === marketplace &&
          s.ano === year &&
          s.mes === month &&
          s.dia === day
      );
    },
    [salesData]
  );

  const getAvailableYears = useCallback((sellerId: string) => {
    const years = [...new Set(salesData.filter((s) => s.sellerId === sellerId).map((s) => s.ano))];
    return years.sort((a, b) => b - a);
  }, [salesData]);

  const getAvailableMonths = useCallback(
    (sellerId: string, year: number) => {
      const months = [
        ...new Set(salesData.filter((s) => s.sellerId === sellerId && s.ano === year).map((s) => s.mes)),
      ];
      return months.sort((a, b) => a - b);
    },
    [salesData]
  );

  const getImportedDataForSeller = useCallback(
    (sellerId: string) => {
      return salesData.filter((s) => s.sellerId === sellerId);
    },
    [salesData]
  );

  const hasImportedDataForSeller = useCallback(
    (sellerId: string) => {
      return salesData.some((s) => s.sellerId === sellerId);
    },
    [salesData]
  );

  const updateSale = useCallback(
    (sellerId: string, marketplace: string, ano: number, mes: number, dia: number, vendaTotal: number) => {
      setSalesData((prev) => {
        const existingIndex = prev.findIndex(
          (s) =>
            s.sellerId === sellerId &&
            s.marketplace === marketplace &&
            s.ano === ano &&
            s.mes === mes &&
            s.dia === dia
        );

        if (existingIndex >= 0) {
          // Update existing record
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], vendaTotal };
          return updated;
        } else {
          // Create new record
          return [...prev, { sellerId, marketplace, ano, mes, dia, vendaTotal }];
        }
      });
    },
    []
  );

  // Update a specific field on a sale record
  const updateSaleField = useCallback(
    (sellerId: string, marketplace: string, ano: number, mes: number, dia: number, field: string, value: number) => {
      setSalesData((prev) => {
        const existingIndex = prev.findIndex(
          (s) =>
            s.sellerId === sellerId &&
            s.marketplace === marketplace &&
            s.ano === ano &&
            s.mes === mes &&
            s.dia === dia
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], [field]: value };
          return updated;
        } else {
          return [...prev, { sellerId, marketplace, ano, mes, dia, vendaTotal: 0, [field]: value }];
        }
      });
    },
    []
  );

  // Find duplicates between new data and existing data
  const findDuplicates = useCallback(
    (sellerId: string, newData: ImportedSale[]): DuplicateCheckResult => {
      const existingData = salesData.filter((s) => s.sellerId === sellerId);

      const duplicates: ImportedSale[] = [];
      const newOnly: ImportedSale[] = [];

      newData.forEach((newRecord) => {
        const isDuplicate = existingData.some(
          (existing) =>
            existing.marketplace === newRecord.marketplace &&
            existing.ano === newRecord.ano &&
            existing.mes === newRecord.mes &&
            existing.dia === newRecord.dia
        );

        if (isDuplicate) {
          duplicates.push(newRecord);
        } else {
          newOnly.push(newRecord);
        }
      });

      // Group by marketplace
      const byMarketplace = duplicates.reduce((acc, record) => {
        if (!acc[record.marketplace]) {
          acc[record.marketplace] = { marketplace: record.marketplace, count: 0, records: [] };
        }
        acc[record.marketplace].count++;
        acc[record.marketplace].records.push({
          ano: record.ano,
          mes: record.mes,
          dia: record.dia,
        });
        return acc;
      }, {} as Record<string, DuplicateInfo>);

      return {
        hasDuplicates: duplicates.length > 0,
        duplicateCount: duplicates.length,
        duplicatesByMarketplace: Object.values(byMarketplace),
        newRecordsOnly: newOnly,
        duplicateRecords: duplicates,
      };
    },
    [salesData]
  );

  // Get marketplace quantity for a specific period
  const getMarketplaceQuantity = useCallback(
    (sellerId: string, marketplace: string, ano: number, mes: number): number => {
      const key = `${sellerId}_${marketplace}_${ano}_${mes}`;
      return marketplaceQuantities[key] ?? 0;
    },
    [marketplaceQuantities]
  );

  // Update marketplace quantity for a specific period
  const updateMarketplaceQuantity = useCallback(
    (sellerId: string, marketplace: string, ano: number, mes: number, qtdVendas: number) => {
      const key = `${sellerId}_${marketplace}_${ano}_${mes}`;
      setMarketplaceQuantities((prev) => ({
        ...prev,
        [key]: qtdVendas,
      }));
    },
    []
  );

  return (
    <SalesDataContext.Provider
      value={{
        salesData,
        importSales,
        appendSales,
        clearSales,
        deleteSale,
        getSalesForMarketplace,
        getSalesForDay,
        getAvailableYears,
        getAvailableMonths,
        getImportedDataForSeller,
        hasImportedData: salesData.length > 0,
        hasImportedDataForSeller,
        updateSale,
        updateSaleField,
        findDuplicates,
        getMarketplaceQuantity,
        updateMarketplaceQuantity,
      }}
    >
      {children}
    </SalesDataContext.Provider>
  );
}

export function useSalesData() {
  const context = useContext(SalesDataContext);
  if (context === undefined) {
    throw new Error("useSalesData deve ser usado dentro de um SalesDataProvider");
  }
  return context;
}
