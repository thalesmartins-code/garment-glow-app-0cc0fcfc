

## Reestruturar visão "Todos" na página de Vendas

### Problema atual
Na visão "Todos", o layout replica gráficos e tabelas de Venda/Hora para cada marketplace (4 gráficos + 4 tabelas). Com 9 lojas, isso se torna inviável e não escala para múltiplos dashboards futuros.

### Solução: Resumo agregado + Gráfico sobreposto

**1. Gráfico de Venda/Hora sobreposto (substituir grid de gráficos)**

Substituir os 4 gráficos individuais por um único `ComposedChart` com:
- Uma linha colorida por marketplace/loja (usando as cores do brand de cada um)
- Eixo Y compartilhado para receita
- Tooltip mostrando valores de cada marketplace na hora selecionada
- Legenda clicável para ocultar/mostrar linhas individuais

```text
┌─────────────────────────────────────────────┐
│  Venda / Hora                               │
│  R$                                         │
│  ─── ML SP (amarelo)                        │
│  ─── ML RJ (amarelo claro)                  │
│  ─── Shopee Sports (laranja)                │
│  ─── Amazon Prime (azul)                    │
│  ...sobrepostas no mesmo gráfico            │
│                                             │
│  00h  02h  04h  06h  08h  10h  ...  22h     │
└─────────────────────────────────────────────┘
```

**2. Tabela Venda/Hora agregada (substituir grid de tabelas)**

Substituir as 4 tabelas individuais por uma única `HourlySalesTable` com dados somados de todas as lojas. Exibir o total consolidado.

**3. Accordion por marketplace (para breakdown opcional)**

Abaixo do resumo agregado, adicionar uma seção com `Collapsible` (já existe no projeto) agrupando lojas por marketplace:
- Header: ícone + nome do marketplace + receita total do período
- Expandido: mini KPIs (receita, pedidos, ticket médio) de cada loja daquele marketplace
- Começa colapsado por padrão

```text
┌─ Mercado Livre ── R$ 45.200 ──────── ▸ ─────┐
│  (colapsado)                                  │
└───────────────────────────────────────────────┘
┌─ Shopee ── R$ 12.800 ────────────── ▸ ───────┐
│  (colapsado)                                  │
└───────────────────────────────────────────────┘
```

Ao expandir:
```text
┌─ Mercado Livre ── R$ 45.200 ──────── ▾ ─────┐
│  ┌ ML SP ─── R$ 28.100 │ 142 pedidos │ TM 198│
│  ┌ ML RJ ─── R$ 17.100 │ 89 pedidos  │ TM 192│
└───────────────────────────────────────────────┘
```

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/MercadoLivre.tsx` | Substituir seção `perMarketplaceHourly` (gráficos grid + tabelas grid) por: 1) gráfico sobreposto único, 2) tabela agregada, 3) accordion por marketplace |
| `src/components/mercadolivre/MarketplaceAccordion.tsx` | **Novo** — componente de breakdown por marketplace com collapsible, mini KPIs por loja |

### Detalhes técnicos

- O gráfico sobreposto usa `Line` do recharts, uma por loja/marketplace, com `stroke` usando a cor do `getMarketplaceBrand(id).gradient`
- Os dados `perMarketplaceHourly` já existem no useMemo (linha ~870); serão reutilizados para gerar as linhas sobrepostas em vez de gráficos separados
- O accordion usa o componente `Collapsible` já presente em `src/components/ui/collapsible.tsx`
- Os dados de receita por marketplace do `perMarketplaceRevenue` (linha ~891) alimentam os headers do accordion

