

## Páginas de Vendas e Estoque reagindo ao marketplace selecionado

### Abordagem

Criar um layer de dados mockados para Amazon, Shopee e Magalu, e fazer as páginas `/api` (Vendas) e `/api/estoque` (Estoque) consumirem o `useMarketplace()` para decidir entre dados reais (ML) ou mock.

### Mudanças

**1. Criar arquivo de mock data (`src/data/marketplaceMockData.ts`)**
- Gerar dados diários, horários e de produtos mock para cada marketplace (Amazon, Shopee, Magalu)
- Gerar itens de estoque mock com variações de preço, quantidade e cobertura
- Estruturas compatíveis com os tipos já usados nas páginas (DailyBreakdown, HourlyBreakdown, ProductSalesRow, InventoryItem)

**2. Modificar `MercadoLivre.tsx` (página de Vendas em `/api`)**
- Importar `useMarketplace()` no topo
- Quando `selectedMarketplace` for "mercado-livre" ou "all": manter comportamento atual (dados reais do Supabase)
- Quando for "amazon", "shopee" ou "magalu": carregar dados mock do arquivo criado, sem chamar Supabase
- Atualizar o título da página para mostrar o nome do marketplace ativo em vez de sempre "Mercado Livre"
- Esconder botões ML-específicos (Sync, Histórico, Perfil ML, Store Selector) quando outro marketplace estiver selecionado

**3. Modificar `MLEstoque.tsx` (página de Estoque em `/api/estoque`)**
- Importar `useMarketplace()` 
- Quando marketplace não for ML: renderizar uma tabela de estoque com itens mock (mesma estrutura visual, dados fictícios)
- Esconder funcionalidades ML-específicas (refresh de inventário real, link para integrações ML)
- Manter KPIs e filtros funcionais com dados mock

**4. Atualizar `MarketplaceContext.tsx`**
- Sem mudanças estruturais — já tem tudo necessário

### Dados mock por marketplace

| Marketplace | Vendas/dia | Ticket médio | Produtos em estoque |
|-------------|-----------|-------------|-------------------|
| Amazon | 15-45 pedidos | R$80-250 | 25 itens |
| Shopee | 30-80 pedidos | R$40-120 | 20 itens |
| Magalu | 10-30 pedidos | R$100-350 | 15 itens |

### Arquivos impactados

| Arquivo | Mudança |
|---------|---------|
| `src/data/marketplaceMockData.ts` | **Novo** — mock data para 3 marketplaces |
| `src/pages/MercadoLivre.tsx` | Condicional por marketplace, título dinâmico |
| `src/pages/mercadolivre/MLEstoque.tsx` | Condicional por marketplace, estoque mock |

