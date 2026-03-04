

## Plan: Replace pages with Marketplace Analytics Pro content

### Summary
Remove the current financial pages (FinanceiroDashboard, FinanceiroReceber, FinanceiroPagar, FinanceiroCaixa, FinanceiroDFC, FinanceiroDRE, FinanceiroRelatorios, Vendas, PDV, Funcionarios, Suporte) and replace them with 5 pages from the source project: **Dashboard**, **Vendas Diarias**, **Importacao**, **Configuracoes**, and **Sellers**. The existing Sidebar, AppLayout, Header, and FloatingChat will be preserved and adapted.

### Pages to create
| Route | Page | Source |
|-------|------|--------|
| `/` | Dashboard (KPIs, marketplace summary, sales table) | Index.tsx |
| `/vendas-diarias` | Vendas Diarias (daily sales chart + table) | DailySales.tsx |
| `/importacao` | Importacao (CSV/Excel upload, Google Sheets sync) | Import.tsx |
| `/configuracoes` | Configuracoes (targets + PMT config) | Settings.tsx |
| `/sellers` | Sellers (CRUD seller management) | Sellers.tsx |

### Dependencies to copy from source project (~30 files)

**Contexts** (3 files):
- `SellerContext.tsx` - seller state management
- `SettingsContext.tsx` - targets/PMT settings
- `SalesDataContext.tsx` - sales data storage

**Hooks** (6 files):
- `useDashboardData.ts`, `useSellerSalesData.ts`, `useSyncAndImport.ts`, `useGoogleSheetsSync.ts`, `useSalesDataDB.ts`, `useCountAnimation.ts`

**Types** (3 files):
- `seller.ts`, `settings.ts`, `import.ts`

**Data** (1 file):
- `mockData.ts`

**Utils** (1 file):
- `csvParser.ts`

**Dashboard components** (8 files):
- `KPICard.tsx`, `SalesTable.tsx`, `DashboardHeader.tsx`, `FilterBar.tsx`, `ProgressBar.tsx`, `EditableQuantityCell.tsx`, `DailySalesChart.tsx`, `DailySalesTable.tsx`

**Import components** (4 files):
- `FileUploader.tsx`, `DataPreview.tsx`, `CSVTemplate.tsx`, `ImportHistory.tsx`

**Settings components** (2 files):
- `TargetForm.tsx`, `PMTTable.tsx`

### Changes to existing files

1. **Sidebar** - Update nav items to: Dashboard (`/`), Vendas Diarias (`/vendas-diarias`), Importacao (`/importacao`), Configuracoes (`/configuracoes`), Sellers (`/sellers`)

2. **App.tsx** - Replace routes, wrap with `SellerProvider`, `SettingsProvider`, `SalesDataProvider`

3. **Pages to use `PageHeader`** - Each copied page will be adapted to use the existing `PageHeader` component instead of inline headers, maintaining visual consistency

### Files to delete
All current page-specific files: `FinanceiroDashboard.tsx`, `FinanceiroReceber.tsx`, `FinanceiroPagar.tsx`, `FinanceiroCaixa.tsx`, `FinanceiroDFC.tsx`, `FinanceiroDRE.tsx`, `FinanceiroRelatorios.tsx`, `Vendas.tsx`, `PDV.tsx`, `Funcionarios.tsx`, `Suporte.tsx`, and their associated components (`src/components/financeiro/*`, `src/components/dashboard/*`, `src/lib/financial-data.ts`, `src/lib/notifications-data.ts`)

### Notes
- Google Sheets sync features will be included but won't work without Supabase edge functions configured
- The `useSalesDataDB` hook likely depends on Supabase -- will need to be adjusted to use localStorage fallback
- Source project uses `dashboard-container` CSS class -- will need to add that or replace with existing patterns

