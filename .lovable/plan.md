

## Comportamento "Todos" — Dados agregados de todos os marketplaces

### Problema atual

Quando "Todos" esta selecionado, as paginas de Vendas e Estoque tratam como se fosse apenas Mercado Livre (`isML = selectedMarketplace === "mercado-livre" || selectedMarketplace === "all"`). Dados de Amazon, Shopee e Magalu sao ignorados.

### Abordagem

Quando `selectedMarketplace === "all"`, carregar dados reais do ML **e** dados mock dos outros 3 marketplaces, somando/mesclando tudo em uma unica visao agregada.

### Mudancas

**1. `src/data/marketplaceMockData.ts` — Nova funcao de agregacao**
- Criar `getAllMarketplaceMockData()` que retorna daily, hourly e products de Amazon + Shopee + Magalu ja somados
- Criar `getAllMarketplaceInventory()` que retorna itens de estoque dos 3 marketplaces concatenados

**2. `src/pages/MercadoLivre.tsx` (Vendas)**
- Mudar logica: `isML` passa a ser apenas `selectedMarketplace === "mercado-livre"`
- Novo estado `isAll = selectedMarketplace === "all"`
- Quando `isAll`:
  - Carregar dados ML reais do Supabase normalmente
  - Carregar mock data dos outros 3 marketplaces
  - Mesclar daily data (somar valores por data), hourly (somar por hora), products (concatenar)
  - KPIs mostram totais agregados
  - Esconder botoes ML-especificos (Historico, Store Selector)
- Quando marketplace individual nao-ML: manter comportamento mock atual

**3. `src/pages/mercadolivre/MLEstoque.tsx` (Estoque)**
- Mesma logica: separar `isML` de `isAll`
- Quando `isAll`:
  - Concatenar itens de estoque ML reais + mock dos outros 3
  - KPIs somam tudo
  - Badge indicando origem (ML real vs simulado) em cada item
- Esconder botao "Atualizar" especifico do ML quando `isAll`

**4. `src/pages/mercadolivre/MLAnuncios.tsx` (Anuncios)**
- Pagina ainda e placeholder "Em breve" — sem mudanca necessaria por enquanto

### Arquivos impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/data/marketplaceMockData.ts` | Adicionar funcoes de agregacao |
| `src/pages/MercadoLivre.tsx` | Separar `isAll` de `isML`, mesclar dados |
| `src/pages/mercadolivre/MLEstoque.tsx` | Separar `isAll` de `isML`, concatenar inventario |

