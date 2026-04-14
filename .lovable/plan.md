

## Plano: Remover seletor de lojas da página /api/integracoes

### Problema
A página `Integrations.tsx` renderiza um componente `<SellerMarketplaceBar showStores={false} />` na linha 751, exibindo um seletor desnecessário no topo da página.

### Alteração
1. **`src/pages/Integrations.tsx`** — Remover a linha 751 (`<SellerMarketplaceBar showStores={false} />`) e o comentário na linha 750. Se o import de `SellerMarketplaceBar` não for mais usado em nenhum outro lugar do arquivo, removê-lo também (linha 12).

Alteração simples de 3 linhas removidas.

