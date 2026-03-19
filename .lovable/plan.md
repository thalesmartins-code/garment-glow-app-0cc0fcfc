

## Plan: Simplificar responsividade dos cards "Venda por Hora" e "Produtos Mais Vendidos"

### Objetivo
- Ranking sempre exibe **10 produtos** (sem lógica de breakpoints)
- Ambos os cards ocupam a mesma altura, com conteúdo preenchendo todo o espaço disponível

### Alterações

**1. `src/components/mercadolivre/TopSellingProducts.tsx`**
- Remover todo o `useEffect` com media queries e o state `maxItems`
- Fixar `products.slice(0, 10)` diretamente
- Trocar `className="h-auto"` do Card por `className="h-full flex flex-col"`
- Adicionar `flex-1` ao `CardContent` para que a lista de produtos preencha todo o espaço vertical restante do card

**2. `src/pages/MercadoLivre.tsx`**
- No grid container, manter `items-stretch` para ambos os cards terem a mesma altura
- Garantir que o `TopSellingProducts` está dentro de um wrapper com `h-full` se necessário (ou que o componente raiz já faz isso)
- Ajustar o slice de `filteredTopProducts` para 10 (se atualmente passa 12)

### Resultado
Os dois cards ficarão sempre com a mesma altura (definida pelo maior), e o conteúdo interno de cada um se expande para preencher o espaço, sem depender de breakpoints.

