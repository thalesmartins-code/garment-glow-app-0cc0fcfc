

## Evolução do Ambiente API para Multi-Marketplace

### Contexto
Atualmente o ambiente "Marketplaces via API" é totalmente centrado no Mercado Livre — rotas, sidebar, layout, contexts e páginas usam nomenclatura "mercado-livre" ou "ML". O objetivo é tornar esse ambiente genérico para suportar múltiplos marketplaces (Amazon, Shopee, Magalu, etc.), mantendo as páginas existentes do ML funcionando.

### O que pode ser melhorado

**1. Renomear rotas e estrutura de `/mercado-livre` para `/api`**
- Rotas passam de `/mercado-livre/*` para `/api/*` (ex: `/api/vendas`, `/api/estoque`, `/api/pedidos`)
- Isso desacopla a URL de um marketplace específico e permite que todas as integrações API compartilhem a mesma estrutura

**2. Sidebar multi-marketplace**
- Renomear `MercadoLivreSidebar` → `ApiSidebar`
- Adicionar seções ou agrupamentos por marketplace na sidebar (ex: cabeçalho "Mercado Livre", "Amazon", etc.) conforme forem sendo integrados
- Manter os itens genéricos (Vendas, Estoque, Anúncios, Pedidos, Publicidade, Integrações) como menu principal

**3. Seletor de Marketplace no header (similar ao seller switcher)**
- Criar um `MarketplaceSwitcher` no header do ambiente API que permite alternar entre marketplaces conectados (Mercado Livre, Amazon, Shopee, etc.)
- Os dados das páginas (Vendas, Estoque, etc.) seriam filtrados pelo marketplace selecionado
- Opção "Todos" para visão agregada

**4. Renomear Layout e Contexts**
- `MercadoLivreLayout` → `ApiLayout`
- `MLStoreContext` e `MLInventoryContext` continuam existindo mas ficam sob um contexto mais amplo de "marketplace ativo"
- Criar um `MarketplaceContext` que gerencia qual marketplace está selecionado e encapsula os sub-contexts

**5. Generalizar páginas**
- As páginas atuais (Vendas, Estoque, etc.) passam a receber o marketplace ativo via context e renderizam dados conforme a integração selecionada
- As páginas ML existentes continuam funcionando — apenas passam a ser condicionais ao marketplace "mercado-livre" estar ativo

**6. Atualizar `routeMeta.ts` e `roleAccess.ts`**
- Trocar todos os paths `/mercado-livre/*` para `/api/*`
- Atualizar títulos para remover "Mercado Livre —" e usar nomenclatura genérica (ex: "Vendas via API", "Estoque via API")

### Estrutura proposta de rotas

```text
/api              → Dashboard de Vendas (filtrado por marketplace selecionado)
/api/estoque      → Gestão de Estoque
/api/anuncios     → Anúncios/Produtos
/api/pedidos      → Pedidos
/api/publicidade  → Publicidade
/api/integracoes  → Integrações (conectar marketplaces)
/api/perfil       → Perfil
```

### Arquivos impactados

| Arquivo | Mudança |
|---------|---------|
| `App.tsx` | Trocar rotas `/mercado-livre/*` → `/api/*` |
| `MercadoLivreLayout.tsx` → `ApiLayout.tsx` | Renomear componente |
| `MercadoLivreSidebar.tsx` → `ApiSidebar.tsx` | Renomear e atualizar paths |
| `AppSelector.tsx` | Atualizar path do card API para `/api` |
| `Header.tsx` | Trocar detecção `isML` para `isApi`, atualizar paths |
| `routeMeta.ts` | Atualizar entradas para `/api/*` |
| `roleAccess.ts` | Atualizar entradas para `/api/*` |
| `MLPageHeader.tsx` | Generalizar para mostrar marketplace ativo |
| Páginas ML (`MercadoLivre.tsx`, `MLEstoque.tsx`, etc.) | Manter lógica, apenas atualizar imports de layout |

### Recomendação de prioridade

Sugiro começar pelo **item 1 (renomear rotas)** + **item 2 (sidebar)** + **item 4 (layout)** + **item 6 (meta/access)** como primeira fase, pois são mudanças estruturais que habilitam todo o resto. O seletor de marketplace (item 3) e a generalização das páginas (item 5) podem vir numa segunda fase quando houver mais integrações conectadas.

