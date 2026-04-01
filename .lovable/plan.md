

## Dashboard de Faturamento por Marketplace e por Loja (visão "Todos")

### O que será criado

Uma nova seção no dashboard "Todos" que mostra o faturamento discriminado por marketplace e por loja, usando barras horizontais empilhadas. Fica abaixo dos KPIs principais e acima do gráfico de Venda/Hora.

### Layout

```text
┌───────────────────────────────────────────────────────────┐
│  Faturamento por Marketplace                              │
│                                                           │
│  Mercado Livre ████████████████████████████  R$ 45.200  52%│
│    ├ ML SP     ██████████████████           R$ 28.100     │
│    └ ML RJ     ████████████                 R$ 17.100     │
│                                                           │
│  Shopee        ████████████████             R$ 22.800  26%│
│    └ Shopee SP ████████████████             R$ 22.800     │
│                                                           │
│  Amazon        ██████████                   R$ 12.400  14%│
│    └ Amazon BR ██████████                   R$ 12.400     │
│                                                           │
│  Magalu        ██████                       R$  6.800   8%│
│    └ Magalu SP ██████                       R$  6.800     │
└───────────────────────────────────────────────────────────┘
```

- Cada marketplace aparece com barra horizontal proporcional à receita total
- Abaixo de cada marketplace, as lojas individuais com barras menores (indent visual)
- Cores das barras seguem o brand de cada marketplace (`marketplaceConfig.ts`)
- Pedidos e ticket médio exibidos em texto secundário ao lado do valor

### Dados

- Utiliza `selectedSeller.stores` para obter as lojas reais agrupadas por marketplace
- Para lojas ML: usa `daily` (dados reais do Supabase)
- Para lojas não-ML: usa `getStoreDailyData()` do `storeMockData.ts`
- Agrupa por marketplace usando `SELLER_TO_MP_ID`

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/mercadolivre/RevenueByMarketplace.tsx` | **Novo** — componente com barras horizontais por marketplace/loja |
| `src/pages/MercadoLivre.tsx` | Adicionar `useMemo` para calcular dados por marketplace/loja; renderizar `RevenueByMarketplace` na seção `isAll` |

### Detalhes técnicos

- O componente `RevenueByMarketplace` recebe um array de grupos `{ mpId, mpName, icon, totalRevenue, totalOrders, stores: { name, revenue, orders }[] }`
- Barras horizontais implementadas com `div` + width percentual (sem dependência de lib de chart)
- Substitui o breakdown atual (`perMarketplaceRevenue` com grid de mini-cards e chevron toggle) por esta seção mais completa e sempre visível

