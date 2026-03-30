

# Parser Shopee Pedidos — Ranking de Produtos

## Análise do Arquivo

O CSV de pedidos tem uma estrutura simples: linha 1 é o cabeçalho, linhas 2+ são os dados. Cada linha é uma linha de pedido (um SKU por linha; pedidos com múltiplos SKUs aparecem em linhas separadas com o mesmo "ID do pedido").

### Colunas relevantes para ranking
| Coluna CSV | Campo interno | Uso |
|---|---|---|
| Nº de referência do SKU principal | sku | Agrupamento por produto |
| Nome do Produto | product_name | Display no ranking |
| Preço acordado | agreed_price | Preço unitário real |
| Quantidade | quantity | Unidades vendidas |
| Subtotal do produto | subtotal | Valor = preço × qty |
| Status do pedido | order_status | Filtrar cancelados/devolvidos |
| Data de criação do pedido | order_date | Data para filtros |
| ID do pedido | order_id | Identificação única |
| Nome da variação | variation | Info adicional |

### Lógica de ranking
- Agrupar por `sku` (Nº de referência do SKU principal)
- Somar `quantity` e `subtotal` apenas de pedidos **não cancelados** (Status ≠ "Cancelado")
- Ordenar por receita (subtotal) ou quantidade

## Etapas

### 1. Criar tabela `shopee_orders`
Armazena cada linha de pedido individualmente. Colunas: `order_id`, `order_status`, `sku`, `product_name`, `variation`, `agreed_price`, `quantity`, `subtotal`, `order_date`, `user_id`. Unique constraint em `(user_id, order_id, sku, variation)` para upserts. RLS por `user_id`.

### 2. Criar parser `parseShopeeOrdersCSV`
Em `marketplaceParsers.ts`:
- Nova interface `ParsedOrderRow` com os campos acima
- Nova função que lê o CSV (header na linha 1, dados a partir da linha 2)
- Reutiliza `splitCsvLine` e `parseBRNumber` existentes

### 3. Atualizar UI de importação
Na página `MLImportacao.tsx`, ao selecionar Shopee, oferecer dois tipos de arquivo:
- **Produto Pago** (relatório de vendas — parser existente)
- **Pedidos** (relatório de pedidos — novo parser)

Cada tipo tem seu próprio preview e salva em tabela diferente (`shopee_sales` vs `shopee_orders`).

### 4. Criar `ImportOrdersPreviewTable`
Novo componente para preview de pedidos com colunas: Produto, Variação, Preço, Qty, Subtotal, Status. Botão de importação faz upsert na `shopee_orders`.

## Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/` | Criar — tabela `shopee_orders` |
| `src/utils/marketplaceParsers.ts` | Editar — novo tipo + parser de pedidos |
| `src/pages/mercadolivre/MLImportacao.tsx` | Editar — seletor de tipo de arquivo Shopee |
| `src/components/import/marketplace/ImportOrdersPreviewTable.tsx` | Criar — preview de pedidos |

