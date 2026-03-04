import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  MonthlyTarget,
  DailyPMT,
  generateTargetId,
  generateDefaultPMTDistribution,
} from "@/types/settings";

interface SettingsContextType {
  targets: MonthlyTarget[];
  getTarget: (sellerId: string, marketplaceId: string, year: number, month: number) => MonthlyTarget | undefined;
  saveTarget: (target: MonthlyTarget) => void;
  deleteTarget: (id: string) => void;
  updatePMTDistribution: (targetId: string, distribution: DailyPMT[]) => void;
  updateTargetValue: (targetId: string, value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "marketplace-settings-targets";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [targets, setTargets] = useState<MonthlyTarget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading settings from localStorage:", e);
    }
    return [];
  });

  // Persist to localStorage whenever targets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
    } catch (e) {
      console.error("Error saving settings to localStorage:", e);
    }
  }, [targets]);

  const getTarget = useCallback(
    (sellerId: string, marketplaceId: string, year: number, month: number): MonthlyTarget | undefined => {
      const id = generateTargetId(sellerId, marketplaceId, year, month);
      return targets.find((t) => t.id === id);
    },
    [targets]
  );

  const saveTarget = useCallback((target: MonthlyTarget) => {
    setTargets((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === target.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = target;
        return updated;
      }
      return [...prev, target];
    });
  }, []);

  const deleteTarget = useCallback((id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updatePMTDistribution = useCallback((targetId: string, distribution: DailyPMT[]) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === targetId ? { ...t, pmtDistribution: distribution } : t
      )
    );
  }, []);

  const updateTargetValue = useCallback((targetId: string, value: number) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === targetId ? { ...t, targetValue: value } : t
      )
    );
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        targets,
        getTarget,
        saveTarget,
        deleteTarget,
        updatePMTDistribution,
        updateTargetValue,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

// Helper hook to get or create a target for specific parameters
export function useTargetConfig(
  sellerId: string,
  marketplaceId: string,
  year: number,
  month: number
) {
  const { getTarget, saveTarget } = useSettings();
  
  const target = getTarget(sellerId, marketplaceId, year, month);
  
  const getOrCreateTarget = useCallback((): MonthlyTarget => {
    if (target) return target;
    
    const newTarget: MonthlyTarget = {
      id: generateTargetId(sellerId, marketplaceId, year, month),
      sellerId,
      marketplaceId,
      year,
      month,
      targetValue: 0,
      pmtDistribution: generateDefaultPMTDistribution(year, month),
    };
    
    return newTarget;
  }, [target, sellerId, marketplaceId, year, month]);
  
  return { target, getOrCreateTarget, saveTarget };
}
