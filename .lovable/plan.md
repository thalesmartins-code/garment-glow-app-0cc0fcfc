## Reformulação da Página de Anúncios (/api/anuncios)

### Objetivo

Transformar a página de Anúncios para seguir o padrão de Vendas, com sistema de abas (Catálogo / Relatórios) e filtros mais relevantes.

### Estrutura de Abas

```text
┌─────────────────────────────────────────────────────┐
│ Anúncios          [Catálogo] [Relatórios]  [Atualizar] │
│ Última sinc: ...                                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Aba Catálogo:                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│  ┌───────────────────────────────────┐              │
│  │ [Busca] [Status] [Estoque] [Ord.] │              │
│  │ Tabela: Anúncio|SKU|Preço|Custo|  │              │
│  │         Estoque|Saúde             │              │
│  └───────────────────────────────────┘              │
│                                                      │
│  Aba Relatórios:                                    │
│  ┌─────────────┐  ┌─────────────────┐              │
│  │ Ranking de   │  │ Vendas por      │              │
│  │ Produtos     │  │ Marca/Categoria │              │
│  └─────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────┘
```

### Alterações Detalhadas

**1. Adicionar sistema de Tabs ao header sticky**

- Inserir `TabsList` com duas abas: "Catálogo" e "Relatórios", no mesmo padrão visual de Vendas (`h-8`, triggers `text-xs px-3 h-7`).

**2. Aba Catálogo**

- Manter os 4 KPI cards atuais (Total de Anúncios, Ticket Médio, Unidades Vendidas, Receita Potencial).
- Adicione indicador de variação semelhante ao da página de estoque.
- Simplificar a tabela para 6 colunas: **Anúncio** (thumbnail + título + ID), **SKU** (extraído do seller_custom_field ou variação), **Preço**, **Custo** (placeholder "a informar" por enquanto, já que custo do produto não está disponível na API), **Estoque**, **Saúde**.
- Remover as colunas de Vendidos, Vendidos R$, % Part., Visitas, Conv., Cobertura e mantenha a visão "Financeiro".
- Remover os sub-filtros antigos (Cobertura, período de cobertura, toggle Estoque/Financeiro).
- Novos filtros: **Busca** (texto), **Status** (Ativo/Pausado/Todos), **Estoque** (Todos/Com estoque/Baixo/Sem estoque), **Ordenar** (A-Z, Maior preço, Menor preço, Mais vendidos).

**3. Aba Relatórios**

- **Ranking de Produtos**: Reutilizar o componente `TopSellingProducts` existente, alimentado com dados do inventário (item_id, title, thumbnail, sold_quantity, price).
- **Vendas por Marca**: Componente novo que agrupa os produtos por "marca" (extraída do título ou de atributos da API). Se a marca não estiver disponível, agrupar por categoria. Exibe barras horizontais com receita, similar ao `RevenueByMarketplace`.

### Arquivos Modificados

- `src/pages/mercadolivre/MLProdutos.tsx` — Refatoração completa: adicionar Tabs, simplificar tabela, novos filtros, aba Relatórios.

### Arquivos Potencialmente Criados

- Nenhum componente novo obrigatório. O ranking usa `TopSellingProducts` existente. O "Vendas por Marca" pode ser implementado inline ou como componente separado se necessário.