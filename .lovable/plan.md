

## Layout "Todos" — Venda por Hora lado a lado por marketplace

### Objetivo

Quando "Todos" estiver selecionado na pagina de Vendas, exibir o grafico e a tabela de "Venda por Hora" separados por marketplace (ML, Amazon, Shopee, Magalu), lado a lado em grid, em vez de uma unica visao agregada. Os KPI cards permanecem agregados no topo. O ranking de produtos continua abaixo de tudo.

### Layout proposto

```text
┌─────────────────────────────────────────────────────────┐
│  KPI Cards (agregados — sem mudanca)                    │
├─────────────────────────────────────────────────────────┤
│  Grafico Venda/Hora  │  Grafico Venda/Hora              │
│  Mercado Livre       │  Amazon                          │
├──────────────────────┼──────────────────────────────────┤
│  Grafico Venda/Hora  │  Grafico Venda/Hora              │
│  Shopee              │  Magalu                          │
├─────────────────────────────────────────────────────────┤
│  Tabela Venda/Hora   │  Tabela Venda/Hora               │
│  Mercado Livre       │  Amazon                          │
├──────────────────────┼──────────────────────────────────┤
│  Tabela Venda/Hora   │  Tabela Venda/Hora               │
│  Shopee              │  Magalu                          │
├─────────────────────────────────────────────────────────┤
│  Ranking Top Produtos (como esta hoje)                  │
└─────────────────────────────────────────────────────────┘
```

### Mudancas

**1. `src/pages/MercadoLivre.tsx`**
- Quando `isAll`, preparar dados hourly **por marketplace** (4 arrays separados): ML real, Amazon mock, Shopee mock, Magalu mock
- Quando `isAll`, preparar dados de chart hourly por marketplace (4 chart datasets)
- Substituir o bloco do grafico + tabela por um grid 2x2 quando `isAll`:
  - 4 mini-graficos ComposedChart (um por marketplace), cada um com titulo indicando o marketplace
  - 4 HourlySalesTable (um por marketplace), cada um com titulo indicando o marketplace
- Os graficos usam o mesmo estilo visual existente, porem em tamanho menor (height ~220px)
- A HourlySalesTable ja recebe `hourly` como prop, basta passar os dados filtrados por marketplace
- Manter o grafico e tabela unificados para quando **nao** for "Todos"

**2. `src/components/mercadolivre/HourlySalesTable.tsx`**
- Adicionar prop opcional `title?: string` para exibir nome do marketplace no CardTitle em vez do fixo "Venda por Hora"
- Adicionar prop opcional `compact?: boolean` para reduzir padding quando em grid 2x2

**3. `src/data/marketplaceMockData.ts`**
- Nenhuma mudanca necessaria — ja exporta `getMarketplaceHourlyData(id)` por marketplace individual

### Detalhes tecnicos

- O grid usa `grid-cols-1 lg:grid-cols-2` para os 4 graficos e 4 tabelas
- Os mini-graficos reutilizam o mesmo `ComposedChart` com `ResponsiveContainer height={220}`
- Cada grafico tera um `CardTitle` com o nome do marketplace (ex: "Venda por Hora — Mercado Livre")
- A HourlySalesTable ja e auto-contida; basta passar hourly data diferentes e um titulo customizado

### Arquivos impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/MercadoLivre.tsx` | Grid 2x2 de graficos + tabelas por MP quando `isAll` |
| `src/components/mercadolivre/HourlySalesTable.tsx` | Props `title` e `compact` opcionais |

