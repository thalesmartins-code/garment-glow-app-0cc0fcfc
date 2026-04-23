

## Relatório "Por Estado" com dados reais + remoção de "Pagamento"

Substituir a aba **Por Estado** (atualmente simulada com percentuais fixos do e-commerce brasileiro) por dados reais agregados a partir do endereço de entrega dos pedidos do Mercado Livre. Remover completamente a aba **Pagamento** do relatório.

### Como os dados de estado serão obtidos

A API de pedidos do ML (`/orders/search`) retorna em cada pedido o objeto `shipping.receiver_address.state` contendo `{ id: "BR-SP", name: "São Paulo" }`. Vamos extrair esse campo durante o processamento já existente na Edge Function `mercado-libre-integration` e agregar por (data, UF). Pedidos sem endereço (raro — apenas alguns digitais) serão classificados como `??`/desconhecido e descartados da visualização.

### Mudanças

**1. Banco de dados (nova tabela)**

`ml_state_daily_cache` — agregação diária por UF:

| coluna | tipo |
|---|---|
| id | uuid PK |
| user_id | uuid (RLS por auth.uid) |
| ml_user_id | text |
| seller_id | uuid |
| date | date |
| uf | text (sigla 2 letras) |
| state_name | text |
| qty_orders | integer |
| revenue | numeric |
| approved_revenue | numeric |
| synced_at | timestamptz |

Unique index: `(user_id, ml_user_id, date, uf)`. Políticas RLS no padrão dos outros caches (`user_id = auth.uid()` em SELECT/INSERT/UPDATE/DELETE).

**2. Edge function `mercado-libre-integration`**

No mesmo loop que já percorre `orders`, acumular em `stateSales[date::uf] = { qty, revenue, approved_revenue, name }` lendo `order.shipping?.receiver_address?.state?.id` (ex: `"BR-SP"` → UF `"SP"`) e `state.name`. Após o loop, fazer upsert em batches de 200 em `ml_state_daily_cache` (mesmo padrão do `ml_product_daily_cache`).

**3. Service layer**

`src/services/mlCacheService.ts` — adicionar `fetchStateDailyCache(userId, mlUserIds, dateFrom, dateTo, selectedStore)` retornando `Array<{ date, uf, state_name, qty_orders, revenue, approved_revenue, ml_user_id }>`. Mesmo padrão de filtro multi-store dos outros fetchers.

**4. React Query**

`src/hooks/useMLQueries.ts` — novo hook `useMLStateQuery(dateFrom, dateTo)` espelhando `useMLProductsQuery`. Chave de cache derivada de `scopeKey + range`.

**5. UI — `MLRelatorios.tsx`**

- **Remover** completamente: import `CreditCard`, constante `PAYMENT_DIST`, função `TabPagamento`, `<TabsTrigger value="pagamento">` e `<TabsContent value="pagamento">`.
- **Reescrever `TabEstado`**:
  - Remover `STATE_DIST` (apenas como fallback de nome/sigla, não para percentuais).
  - Consumir `useMLStateQuery(currentFrom, currentTo)` (mesmo período usado nos outros tabs do relatório, derivado de `useMLFilters`).
  - Agregar por UF: `revenue`, `orders`, `avgTicket`, `pct = revenue / totalRevenue * 100`.
  - Manter exatamente os mesmos componentes visuais (BrazilHeatMap, Top 10, BarChart) — só trocar a fonte dos dados.
  - Remover o `<SimNote text="Distribuição estimada..." />`.
  - Empty state: "Sem dados de estado para o período. Sincronize para carregar pedidos com endereço de entrega."

**6. Backfill**

Não é necessário backfill ativo — a próxima sincronização (manual ou automática) preenche `ml_state_daily_cache` para todo o range solicitado. Adicionar nota visual leve "Dados carregados após próxima sincronização" caso a query retorne vazio mas existam pedidos no `ml_daily_cache` no mesmo período.

### Layout final das abas

```text
[ Venda por Hora ] [ Ticket Médio ] [ Por Estado ] [ Funil ]
```

(Pagamento removida.)

### Detalhes técnicos

- **UF parsing**: `state.id` no formato `"BR-XX"` → split em `-` e pegar índice 1; fallback para mapear `state.name` quando `id` ausente.
- **Frete digital / sem endereço**: pular o pedido na agregação de estado (não criar UF "desconhecido" para não poluir o mapa).
- **Performance**: o loop adicional dentro de `mercado-libre-integration` é O(orders) e não adiciona requests à API ML — todos os campos já vêm em `/orders/search`.
- **TypeScript**: após a migração, `src/integrations/supabase/types.ts` será regenerado automaticamente; o serviço usa `(data || []) as StateDailyRow[]` igual aos outros fetchers.
- **Sem alteração** em `BrazilHeatMap.tsx` (interface de input `StateData[]` já compatível).

### Arquivos afetados

- `supabase/migrations/<timestamp>_ml_state_daily_cache.sql` *(novo)*
- `supabase/functions/mercado-libre-integration/index.ts` — agregação + upsert
- `src/services/mlCacheService.ts` — novo fetcher
- `src/hooks/useMLQueries.ts` — novo `useMLStateQuery`
- `src/types/mlCache.ts` — novo tipo `StateDailyRow`
- `src/pages/mercadolivre/MLRelatorios.tsx` — remover Pagamento, reescrever TabEstado

