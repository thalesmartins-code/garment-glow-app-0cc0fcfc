

## Filtro de Marca no Ranking + Reformulação "Por Marca" com Gráficos

### Alterações

**1. Ranking de Anúncios — Filtro de marca**
- Adicionar um `Select` de marca acima da tabela de ranking (mesmo componente já usado no catálogo).
- Criar estado `rankingBrandFilter` e filtrar `rankingAll` por marca selecionada.
- Recalcular os KPIs com base nos itens filtrados.

**2. Renomear sub-aba "Por Marca" → "Análise por Marca"**

**3. Análise por Marca — Adicionar gráficos**
Acima da tabela existente, inserir dois gráficos lado a lado usando Recharts (já instalado via `chart.tsx`):

- **Gráfico de barras horizontal**: Receita por marca (top 10), usando `BarChart` com layout vertical.
- **Gráfico de pizza/donut**: Distribuição de unidades vendidas por marca (top 8 + "Outros").

Manter a tabela completa abaixo dos gráficos.

### Arquivo modificado

`src/pages/mercadolivre/MLProdutos.tsx`

### Detalhes técnicos

- Importar `BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell` de `recharts`.
- Usar paleta de cores derivada do tema (hsl vars ou array fixo harmonizado).
- Estado `rankingBrandFilter` (string, default `"all"`).
- `rankingFiltered = rankingAll.filter(...)` com memo derivado.
- Gráficos em `grid grid-cols-2 gap-4` com altura de 280px, dentro de Cards com título.

