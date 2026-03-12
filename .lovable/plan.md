

# Submenus do Mercado Livre no Sidebar

## Objetivo
Transformar o item "Mercado Livre" no sidebar em um grupo expansível com 5 subpáginas: Dashboard, Estoque, Produtos, Pedidos e Anúncios.

## Mudanças

### 1. Sidebar (`src/components/layout/Sidebar.tsx`)
- Substituir o item simples "Mercado Livre" por um item com submenu colapsável (usando Collapsible do Radix)
- Subitens: Dashboard (`/mercado-livre`), Estoque (`/mercado-livre/estoque`), Produtos (`/mercado-livre/produtos`), Pedidos (`/mercado-livre/pedidos`), Anúncios (`/mercado-livre/anuncios`)
- O grupo abre automaticamente quando a rota ativa é qualquer `/mercado-livre/*`
- No modo collapsed, mostra tooltip com os subitens

### 2. Novas páginas (placeholder)
Criar 4 páginas iniciais com layout básico:
- `src/pages/mercadolivre/MLEstoque.tsx`
- `src/pages/mercadolivre/MLProdutos.tsx`
- `src/pages/mercadolivre/MLPedidos.tsx`
- `src/pages/mercadolivre/MLAnuncios.tsx`

Cada uma com título e mensagem "Em breve" por enquanto.

### 3. Rotas (`src/App.tsx`)
Adicionar as 4 novas rotas dentro do layout protegido com RoleRoute.

### 4. Controle de acesso (`src/config/roleAccess.ts`)
Registrar as novas rotas com as mesmas permissões de `/mercado-livre` (admin, editor, viewer).

### Visual do submenu expandido
```text
  🏪 Mercado Livre    ▾
       Dashboard
       Estoque
       Produtos
       Pedidos
       Anúncios
```

