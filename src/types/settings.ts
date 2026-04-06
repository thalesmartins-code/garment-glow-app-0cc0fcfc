export interface DailyPMT {
  day: number; // 1-31
  pmt: number; // porcentagem (ex: 3.5)
}

export interface MonthlyTarget {
  id: string;
  sellerId: string;
  marketplaceId: string;
  year: number;
  month: number; // 1-12
  targetValue: number; // Legacy: total revenue target (kept for backward compat)
  // Multi-KPI targets (optional — fallback to targetValue for revenue if absent)
  kpiTargets?: {
    revenue?: number;    // Meta de receita mensal
    orders?: number;     // Meta de pedidos
    ticket?: number;     // Meta de ticket médio
    conversion?: number; // Meta de conversão (%)
  };
  pmtDistribution: DailyPMT[];
}

export interface SettingsState {
  targets: MonthlyTarget[];
}

// Helper to generate a unique ID for a target
export function generateTargetId(sellerId: string, marketplaceId: string, year: number, month: number): string {
  return `${sellerId}-${marketplaceId}-${year}-${month}`;
}

// Get days in a month
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Get day of week for a specific date (0 = Sunday, 6 = Saturday)
export function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}

// Day of week labels in Portuguese
export const dayOfWeekLabels: Record<number, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

// Day of week short labels
export const dayOfWeekShortLabels: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

// Default PMT weights by day of week (based on typical retail patterns)
export const defaultPMTWeights: Record<number, number> = {
  0: 2.5,  // Domingo
  1: 3.2,  // Segunda
  2: 3.3,  // Terça
  3: 3.4,  // Quarta
  4: 3.5,  // Quinta
  5: 4.0,  // Sexta
  6: 3.8,  // Sábado
};

// Generate default PMT distribution for a month
export function generateDefaultPMTDistribution(year: number, month: number): DailyPMT[] {
  const daysInMonth = getDaysInMonth(year, month);
  const distribution: DailyPMT[] = [];
  
  // First pass: calculate raw weights based on day of week
  let totalWeight = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = getDayOfWeek(year, month, day);
    const weight = defaultPMTWeights[dayOfWeek];
    distribution.push({ day, pmt: weight });
    totalWeight += weight;
  }
  
  // Second pass: normalize to 100%
  for (let i = 0; i < distribution.length; i++) {
    distribution[i].pmt = Number(((distribution[i].pmt / totalWeight) * 100).toFixed(2));
  }
  
  // Adjust rounding errors to ensure exactly 100%
  const currentTotal = distribution.reduce((sum, d) => sum + d.pmt, 0);
  const diff = 100 - currentTotal;
  if (distribution.length > 0) {
    distribution[distribution.length - 1].pmt = Number((distribution[distribution.length - 1].pmt + diff).toFixed(2));
  }
  
  return distribution;
}

// Generate uniform PMT distribution
export function generateUniformPMTDistribution(year: number, month: number): DailyPMT[] {
  const daysInMonth = getDaysInMonth(year, month);
  const uniformPMT = Number((100 / daysInMonth).toFixed(2));
  const distribution: DailyPMT[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    distribution.push({ day, pmt: uniformPMT });
  }
  
  // Adjust last day to ensure exactly 100%
  const currentTotal = distribution.reduce((sum, d) => sum + d.pmt, 0);
  const diff = 100 - currentTotal;
  if (distribution.length > 0) {
    distribution[distribution.length - 1].pmt = Number((distribution[distribution.length - 1].pmt + diff).toFixed(2));
  }
  
  return distribution;
}

// Month labels in Portuguese
export const monthLabels: Record<number, string> = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};
