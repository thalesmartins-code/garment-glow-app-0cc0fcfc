

## Plan: Add Daily/Monthly View Toggle to KPI Cards

### Overview
Add a "Diario/Mensal" toggle filter to the filter bar. When "Diario" is selected, KPI cards show data for the current day only. When "Mensal" is selected (current behavior), KPI cards show aggregated monthly data.

### Changes

**File: `src/pages/DailySales.tsx`**

1. Add a new state `viewMode` with values `"diario"` or `"mensal"` (default: `"mensal"`).

2. Add a toggle/select in the filter card (alongside existing filters) with label "Visao:" and options "Diario" / "Mensal". Use Tabs component for a clean toggle look.

3. Add a new `dailyMetrics` useMemo that extracts data for the current day only:
   - Find the row in `dailySalesData` where `dia === currentDate.getDate()` (only when month/year match current).
   - Extract: `vendaTotal`, `metaVendas`, `gap`, `metaAtingida`, `vendaAnoAnterior`, `yoyDia` from that single day.

4. Conditionally render KPI cards based on `viewMode`:
   - **Mensal** (current behavior): Keep existing cards unchanged.
   - **Diario**: Show cards with daily values:
     - "Venda bruta aprovada (Hoje)" = day's `vendaTotal`
     - "Meta do dia" = day's `metaVendas`
     - "% da meta (Dia)" = day's `metaAtingida`
     - "GAP (Dia)" = day's `gap`
     - Row 2 adjusts similarly with daily YoY, etc.

### Technical Notes
- Uses existing `dailySalesData` array; no new data fetching needed.
- The Tabs component (`@radix-ui/react-tabs`) is already installed and available.
- If the current day has no data, show zero values with a subtle indicator.

