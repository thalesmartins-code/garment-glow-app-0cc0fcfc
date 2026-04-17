
# Plano: Remover ambiente "Marketplaces via Planilha"

## Objetivo
Eliminar todo o ambiente `/sheets` e o hub seletor `/`, fazendo a aplicação iniciar direto no ambiente API (`/api`). Apagar código morto associado: páginas, contextos, hooks, componentes, edge function e dados mock que sobravam apenas para o fluxo via planilha.

## 1. Roteamento e ponto de entrada

**`src/App.tsx`**
- Remover imports e rotas: `AppSelector`, `MainAppLayout`, `Index`, `DailySales`, `Import`, `Settings`, `Sellers` (a rota `/sheets/sellers` — manter o componente, é reusado em `/api/sellers`), `UserManagement` (manter — usado em `/api/usuarios`), `TVMode` legado (`/tv`), bloco inteiro `<Route element={<MainAppLayout />}>...</Route>`.
- Mudar a rota raiz `"/"` para redirecionar a `/api` (`<Navigate to="/api" replace />`).
- Manter `/perfil` redirecionando para `/api/perfil` (compat) ou remover.
- Remover rota `/tv` legado (manter apenas `/api/tv`).

**`src/components/auth/OAuthCodeRedirect.tsx`**
- Simplificar: callback OAuth sempre vai para `/api/integracoes`. Remover a lógica `isSheets`.

## 2. Páginas a deletar

- `src/pages/AppSelector.tsx`
- `src/pages/Index.tsx` (dashboard sheets)
- `src/pages/DailySales.tsx`
- `src/pages/Import.tsx`
- `src/pages/Settings.tsx` (config PMT/Meta sheets — substituído por `/api/metas` e `/api/precos-custos`)
- `src/pages/TVMode.tsx` (legado — `/api/tv` permanece via `TVModeVendas`)

## 3. Layout / sidebar

- `src/components/layout/MainAppLayout.tsx` → deletar
- `src/components/layout/MainSidebar.tsx` → deletar
- `src/components/layout/EnvironmentSidebar.tsx` → deletar (era compartilhado entre os dois sidebars; `ApiSidebar` não usa)
- `src/components/layout/AppLayout.tsx` e `DashboardLayout.tsx` → verificar uso e deletar se órfãos
- `src/components/layout/LayoutShell.tsx` → remover entradas `/sheets/*` em `HIDE_SELLER_SWITCHER_ROUTES`
- `src/components/layout/Header.tsx` → remover variável `isApi` e usar sempre paths `/api/...` para perfil/usuários
- `src/components/layout/routeMeta.ts` → remover todas as entradas `/sheets/*` e `/perfil`

## 4. Configuração de acesso

- `src/config/roleAccess.ts` → remover todas as chaves `/sheets/*`, `/`, `/perfil`. Manter apenas as `/api/*`.

## 5. Contextos, hooks e utilidades exclusivos do fluxo planilha

A deletar (não são usados por nenhuma página `/api/*`):
- `src/contexts/SalesDataContext.tsx`
- `src/contexts/SettingsContext.tsx` ⚠ **ATENÇÃO**: também usado por `MLMetas.tsx` e `GoalsCard.tsx`. Verificar e migrar essas dependências para um store local/`localStorage` simples antes de deletar, OU manter o contexto enxuto. **Decisão recomendada:** manter `SettingsContext` (é fonte das metas em `/api/metas`), apenas remover provider de `SalesDataContext`.
- `src/hooks/useGoogleSheetsSync.ts`
- `src/hooks/useSyncAndImport.ts`
- `src/hooks/useSalesDataDB.ts`
- `src/hooks/useSellerSalesData.ts` (só consumido por Index/DailySales/TVMode legado)
- `src/hooks/useDashboardData.ts` (idem)
- `src/utils/csvParser.ts` e `src/utils/marketplaceParsers.ts`
- `src/types/import.ts`

## 6. Componentes dashboard/import legados

A deletar:
- `src/components/dashboard/SalesChart.tsx`, `SalesTable.tsx`, `RecentSales.tsx`, `TopProducts.tsx`, `MetricCard.tsx`, `DashboardHeader.tsx`, `FilterBar.tsx`, `DailySalesChart.tsx`, `DailySalesTable.tsx`, `EditableQuantityCell.tsx`, `ProgressBar.tsx`
  - **Manter:** `KPICard.tsx` (usado em todo `/api`)
- `src/components/import/` (pasta inteira — `CSVTemplate`, `DataPreview`, `FileUploader`, `ImportHistory`, e subpasta `marketplace/` se não for usada por `MLImportacao`).
  - ⚠ Verificar se `MLImportacao` reusa algum componente (provável reuso de `marketplace/*`). Se sim, manter apenas o necessário.
- `src/components/settings/PMTTable.tsx`, `TargetForm.tsx` → confirmar não-uso fora de `Settings.tsx`

## 7. Edge function

- Excluir `supabase/functions/google-sheets-sync/` via `supabase--delete_edge_functions`
- Remover entrada correspondente em `supabase/config.toml`
- Remover secrets `GOOGLE_*` (orientar usuário se necessário)

## 8. Mock data (avaliar)

`src/data/mockData.ts`, `marketplaceMockData.ts`, `storeMockData.ts`, `financialMockData.ts`, `adsMockData.ts`, `pedidosMockData.ts`, `perguntasMockData.ts`, `reputacaoMockData.ts`, `devolucoesMockData.ts` — vários ainda são consumidos por páginas `/api/*` (MercadoLivre.tsx, MLPedidos, MLDevolucoes, MLPerguntas, MLReputacao, MLProdutos) como fallback ou tipos. **Manter por ora**, marcar limpeza futura. Apenas `mockData.ts` (tipos `DailySale`, `PeriodFilter`) é candidato a remoção — confirmar e migrar tipos para `src/types/` se necessário.

## 9. localStorage / chaves a limpar

Adicionar limpeza única no boot (opcional): `google_spreadsheet_id`, `selected_seller_id_v3` (manter — usado), `marketplace-settings-targets` (manter — metas).

## 10. Memory updates

- Atualizar `mem://project/app-architecture` removendo a divisão hub/sheets/api → app é `/api` only.
- Atualizar `mem://core` index removendo "`/` é central hub. Rotas split entre `/sheets` e `/api`."
- Remover memórias específicas de planilha: `mem://integrations/google-sheets/auth-logic`, `mem://features/import/*`, `mem://features/import/shopee-parser`, `mem://features/import/configuration`, `mem://features/import/ui-logic`, `mem://features/vendas/*` (revisar quais ainda se aplicam ao `/api`).

## Resumo do escopo (arquivos)

```text
DELETAR:
  6 páginas, 2 layouts/sidebars, ~12 componentes dashboard,
  pasta src/components/import/ (parcial), 5 hooks, 2 contextos parciais,
  2 utils, 1 types/import.ts, 1 edge function

EDITAR:
  src/App.tsx, OAuthCodeRedirect, Header, LayoutShell,
  routeMeta, roleAccess, supabase/config.toml, mem://
```

## Pontos a confirmar antes de executar

1. `src/components/import/marketplace/` — usado por `MLImportacao`? Verificar e preservar o necessário.
2. `Sellers.tsx` e `UserManagement.tsx` permanecem (reusados em `/api/sellers` e `/api/usuarios`) — apenas remover importações antigas.
3. `Profile.tsx` permanece (reusado em `/api/perfil`).
4. Deletar `/tv` legado e manter apenas `/api/tv`?  → **Sim**, recomendado.
5. Rota `/` redireciona para `/api` — confirmar que é o destino padrão desejado.
