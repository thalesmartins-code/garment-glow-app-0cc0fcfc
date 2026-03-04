

## Plan: Restore Original Visual Patterns (Header, Layout)

### Problem
The migrated pages each have their own inline header (icon + title block), but the original project used a **persistent `Header` component** at the top of every page (with search bar, notification bell, user avatar dropdown). The current `AppLayout` does not include this `Header`, so the pages look different from the original design.

### Changes

**1. Update `AppLayout.tsx`** to include the `Header` component, similar to the original `DashboardLayout`:
- Add `Header` between `Sidebar` and `<main>`
- Add `p-8` padding to `<main>` for consistent spacing

Since `AppLayout` uses `<Outlet />` (no `title` prop), we need a way to pass the title. Two options:
- Use a context or state to pass page title to header
- Or keep a simpler approach: render the `Header` with a generic title from route, and let each page provide its own subtitle

Simpler approach: Each page will set a title via a small context, or we just use the `PageHeader` at the layout level with a route-based title mapping.

**Simplest approach**: Add the `Header` component into `AppLayout` with the page title derived from the current route path. Remove inline headers from all 5 pages.

**2. Remove inline headers from all 5 pages:**
- `Index.tsx` - remove `DashboardHeader` usage and the custom header block
- `DailySales.tsx` - remove the inline header div
- `Import.tsx` - remove the inline header div
- `Settings.tsx` - remove the inline header div (keep Save button)
- `Sellers.tsx` - remove the inline header div (keep "Novo Seller" button)

**3. Update `AppLayout.tsx`** to include `Header` with route-based title:
```
const routeTitles: Record<string, {title: string, subtitle: string}> = {
  "/": { title: "Dashboard", subtitle: "Monitoramento de performance por marketplace" },
  "/vendas-diarias": { title: "Vendas Diárias", subtitle: "Acompanhe o desempenho diário" },
  "/importacao": { title: "Importação", subtitle: "Importe dados de vendas" },
  "/configuracoes": { title: "Configurações", subtitle: "Metas e distribuição PMT" },
  "/sellers": { title: "Sellers", subtitle: "Gerencie sellers e marketplaces" },
};
```

**4. Replace `dashboard-container` padding** in pages with simpler `space-y-6` since `AppLayout` will handle the `p-8` padding.

### Files to modify
- `src/components/layout/AppLayout.tsx` - Add Header, add p-8 to main
- `src/pages/Index.tsx` - Remove DashboardHeader + dashboard-container wrapper
- `src/pages/DailySales.tsx` - Remove inline header
- `src/pages/Import.tsx` - Remove inline header
- `src/pages/Settings.tsx` - Remove inline header, move Save button
- `src/pages/Sellers.tsx` - Remove inline header, move Novo Seller button

