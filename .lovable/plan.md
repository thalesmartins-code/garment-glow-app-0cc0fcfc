

# Importação de Dados por Marketplace (API)

## Resumo

Criar uma nova página de Importação no ambiente de API (`/api/importacao`) com parsers nativos para arquivos exportados da Shopee, Amazon e Magalu. Os dados serão armazenados em tabelas separadas por marketplace no Supabase.

## Dependência: Arquivos de Exemplo

Antes de implementar os parsers, preciso receber um arquivo de exemplo de cada plataforma para mapear as colunas corretamente. A estrutura da página e o fluxo de upload podem ser criados agora; os parsers serão finalizados após análise dos arquivos.

## Etapas

### 1. Criar tabelas no Supabase

Criar uma tabela por marketplace para armazenar os dados importados:
- `shopee_sales` - vendas importadas da Shopee
- `amazon_sales` - vendas importadas da Amazon
- `magalu_sales` - vendas importadas da Magalu

Cada tabela terá colunas base (id, user_id, data, receita, pedidos, etc.) mais colunas específicas de cada plataforma (a definir após análise dos arquivos). RLS com acesso por `user_id = auth.uid()`.

### 2. Criar a página `/api/importacao`

Nova página `src/pages/mercadolivre/MLImportacao.tsx` com:
- Seletor de marketplace (Shopee, Amazon, Magalu) com ícones
- Área de upload (drag-and-drop) para CSV/Excel
- Preview dos dados parseados antes de confirmar
- Botão de importação que salva no Supabase
- Histórico de importações por marketplace

### 3. Criar parsers nativos

Um parser por plataforma em `src/utils/marketplaceParsers.ts`:
- `parseShopeeFile(content)` - mapeia colunas do relatório Shopee
- `parseAmazonFile(content)` - mapeia colunas do relatório Amazon
- `parseMagaluFile(content)` - mapeia colunas do relatório Magalu

Cada parser normaliza os dados para um formato interno comum.

### 4. Registrar rotas e navegação

- Adicionar item "Importação" no `ApiSidebar` (ícone Upload)
- Registrar rota `/api/importacao` no `App.tsx`
- Adicionar permissão no `roleAccess.ts` para admin e editor

## Arquivos a criar/editar

| Arquivo | Ação |
|---|---|
| `src/pages/mercadolivre/MLImportacao.tsx` | Criar |
| `src/utils/marketplaceParsers.ts` | Criar |
| `src/components/layout/ApiSidebar.tsx` | Editar - adicionar item |
| `src/App.tsx` | Editar - adicionar rota |
| `src/config/roleAccess.ts` | Editar - adicionar permissão |
| `supabase/migrations/` | Criar - tabelas por marketplace |

## Aguardando

Envie os arquivos de exemplo das 3 plataformas para eu criar os parsers e definir as colunas das tabelas.

