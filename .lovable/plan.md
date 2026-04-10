

## Plano: Refatoração do Seletor de Seller/Loja no Header

### Problema Atual

Existem **dois sistemas de seleção sobrepostos** que não se comunicam bem:

1. **SellerContext** (`selectedSeller` + `selectedStoreIds`) — usado pelo `SellerMarketplaceBar` e `StoreGroupSelector` (chips). Controla seller e lojas genéricas (seller_stores).
2. **MLStoreContext** (`selectedStore`) — usado pelo `MLStoreSelector` (Select separado no header). Controla lojas ML (ml_tokens) e o cache de vendas.

Quando o usuário troca seller ou loja em um, o outro não reage. A página de Vendas usa `MLStoreContext.selectedStore` para filtrar queries no Supabase, mas o `SellerMarketplaceBar` usa `SellerContext.selectedStoreIds`. Resultado: trocar no header não muda os dados.

### Solução: Unificar o fluxo

Remover o `MLStoreSelector` separado e fazer o `SellerMarketplaceBar` (que já existe e já mostra seller + chips de lojas) ser a **única fonte de verdade**. O `MLStoreContext` passará a derivar `selectedStore` a partir do `SellerContext`.

### Mudanças

#### 1. Conectar MLStoreContext ao SellerContext (`src/contexts/MLStoreContext.tsx`)
- Ao invés de manter `selectedStore` como estado próprio, derivá-lo de `SellerContext.selectedStoreIds`:
  - Se nenhuma loja selecionada (todos) → `selectedStore = "all"`
  - Se uma loja ML selecionada → buscar o `ml_user_id` correspondente via `external_id` do `seller_stores` ou mapeamento `seller_id`
  - Se múltiplas lojas ML selecionadas → agregar dados (como já faz com "all", mas filtrado)
- Remover `setSelectedStore` do contexto público (seleção vem do SellerContext)
- Manter `handleSetSelectedStore` interno para reset de cache

#### 2. Vincular seller_stores.external_id ao ml_user_id (`src/contexts/MLStoreContext.tsx`)
- Na `fetchStores`, cruzar `ml_tokens.ml_user_id` com `seller_stores.external_id` para saber qual loja do seller corresponde a qual conta ML
- Expor um mapa `storeId → ml_user_id` para que a seleção do `StoreGroupSelector` se traduza em filtro ML

#### 3. Remover MLStoreSelector do Header (`src/components/layout/Header.tsx`)
- Remover o import e renderização do `MLStoreSelector`
- O `SellerMarketplaceBar` (já presente no header via `showSellerMarketplaceBar`) será o único controle

#### 4. Atualizar MercadoLivre.tsx (Vendas) (`src/pages/MercadoLivre.tsx`)
- Já usa `selectedStore` do MLStoreContext — continuará funcionando automaticamente após a refatoração
- Remover referências diretas ao `selectedStoreIds` do SellerContext que duplicam lógica
- Garantir que o efeito de reset (linha 751) reaja a mudanças no `selectedStore` derivado

#### 5. Verificar Estoque e Anúncios
- `MLInventoryContext` já usa `useMLStore().selectedStore` — funcionará automaticamente
- `useMLAds` já usa `useMLStore().stores` e `selectedStore` — funcionará automaticamente
- Nenhuma mudança adicional necessária nestes hooks/contextos

### Arquivos a modificar
- `src/contexts/MLStoreContext.tsx` — derivar selectedStore do SellerContext
- `src/components/layout/Header.tsx` — remover MLStoreSelector
- `src/components/mercadolivre/MLStoreSelector.tsx` — deletar (ou manter vazio)
- `src/pages/MercadoLivre.tsx` — simplificar uso de seletores

### Resultado Esperado
- Trocar seller no header → MLStoreContext refaz fetch → dados recarregam em Vendas, Estoque e Anúncios
- Selecionar loja específica (ex: "Meli SP") nos chips → MLStoreContext deriva `selectedStore` correto → queries filtram por `ml_user_id`
- Um único ponto de controle no header para todas as páginas

