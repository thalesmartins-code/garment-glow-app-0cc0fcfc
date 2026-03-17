

# Plano: Substituir KPIs por Visitas, Compradores e Conversão

## Contexto
Substituir os cards "Anúncios Ativos", "Pedidos Enviados" e "Pedidos Cancelados" por:
1. **Visitas Únicas** — total de visitas nos anúncios do vendedor
2. **Total de Compradores** — compradores únicos extraídos dos pedidos
3. **Conversão** — compradores / visitas únicas (%)

## Origem dos dados

- **Visitas**: API do Mercado Livre `/users/{sellerId}/items_visits?date_from=...&date_to=...` retorna `total_visits` agregado por período.
- **Compradores únicos**: Extraído dos pedidos já buscados — contar `buyer.id` distintos.
- **Conversão**: cálculo `(unique_buyers / total_visits) * 100`.

## Alterações

### 1. Database — nova coluna em `ml_daily_cache`
Adicionar colunas `unique_visits` (integer, default 0) e `unique_buyers` (integer, default 0) à tabela `ml_daily_cache` via migration. Remover dependência de `shipped_orders` e `cancelled_orders` nos KPIs (manter colunas existentes para compatibilidade).

### 2. Edge Function `mercado-libre-integration`
- Após buscar pedidos, contar `buyer.id` distintos por dia e no total.
- Após buscar pedidos, chamar `/users/{sellerId}/items_visits?date_from=...&date_to=...` para obter visitas agregadas. A API retorna visitas por dia — mapear para o `dailySales`.
- Incluir `unique_visits` e `unique_buyers` no objeto de cache diário e na resposta.
- Adicionar `unique_visits`, `unique_buyers` e `conversion_rate` nos `metrics` da resposta.

### 3. Frontend `MercadoLivre.tsx`
- Atualizar `DailyBreakdown` interface para incluir `unique_visits` e `unique_buyers`.
- Atualizar `loadFromCache` e `saveToCache` para ler/gravar os novos campos.
- Substituir os 3 KPIs na segunda linha:
  - **Visitas Únicas** — ícone Eye, variant neutral
  - **Total de Compradores** — ícone Users, variant success
  - **Conversão** — ícone Percent, variant info, formato `X.X%`
- Computar métricas: somar visitas e compradores do `daily` filtrado; conversão = buyers/visits*100.

### Detalhes técnicos

**API de Visitas ML**: `GET /users/{sellerId}/items_visits?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD` — retorna array `results` com `{ date, total }`. Visitas são únicas por dia. Limite de 150 dias.

**Compradores únicos por dia**: Nos pedidos já retornados, agrupar por `(date, buyer.id)` e contar distintos por dia.

**Migration SQL**:
```sql
ALTER TABLE ml_daily_cache ADD COLUMN unique_visits integer NOT NULL DEFAULT 0;
ALTER TABLE ml_daily_cache ADD COLUMN unique_buyers integer NOT NULL DEFAULT 0;
```

