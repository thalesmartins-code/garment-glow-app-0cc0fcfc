

## Reestruturação do layout do Modo TV de Vendas

### Novo layout (3 linhas)

```text
┌──────────────────────────────────────────────────────┐
│ Header + KPI Cards (5 cols)                          │
├──────────────────────────────────────────────────────┤
│ Receita por Hora (linha inteira)                     │
│  - Linha "Total" (soma das lojas) + Linha "Ontem"    │
├──────────────────────────┬───────────────────────────┤
│ Receita por Marca        │ Top 5 Anúncios            │
│ (gráfico pizza)          │ (tabela)                  │
└──────────────────────────┴───────────────────────────┘
```

### Alterações em `src/pages/TVModeVendas.tsx`

**1. Receita por Hora - linha inteira com dados somados + dia anterior**
- Remover o grid 7 colunas. Receita por Hora ocupa 100% da largura em sua própria linha.
- No `fetchSellerData`, buscar também dados de ontem (`yesterday`) na `ml_hourly_cache`.
- Calcular uma linha "Total" somando todas as lojas por hora, e uma linha "Ontem" somando o dia anterior.
- Exibir duas `Line`: "Hoje" (total) e "Ontem" (dia anterior), com cores distintas e legenda.

**2. Top Anúncios - reduzir para 5 produtos**
- `.slice(0, 5)` em vez de 10 no render.
- Título: "Top 5 Anúncios".

**3. Receita por Marca - gráfico pizza**
- Substituir `BarChart` horizontal por `PieChart` com `Pie` + `Cell`.
- Adicionar import de `PieChart, Pie` do recharts.
- Legenda customizada com nome + valor ao lado do gráfico.

**4. Layout inferior: grid 2 colunas**
- Linha inferior com `grid grid-cols-2`: pizza de marcas à esquerda, top 5 anúncios à direita.

### Arquivo afetado
- `src/pages/TVModeVendas.tsx`

