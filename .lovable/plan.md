
Objetivo

Separar o app em 2 ambientes visuais, mantendo o mesmo header:
1. Ambiente principal: Dashboard, Vendas, Importação, Sellers, Integrações e Usuários
2. Ambiente Mercado Livre: apenas Vendas, Estoque, Produtos, Pedidos e Anúncios

Regras definidas
- Entrada no ambiente ML: por um item dedicado no menu principal
- Saída do ambiente ML: por um item no menu do próprio ambiente
- No ambiente ML, o header continua igual, mas sem alternador de seller

O que identifiquei no código atual

- Hoje existe um único `AppLayout` com:
  - `Sidebar`
  - `Header`
  - `Outlet`
- O `Sidebar` mistura navegação principal com o grupo “Mercado Livre”
- O `Header` sempre usa `useSeller()` e sempre renderiza o alternador
- As rotas de ambos os contextos estão todas agrupadas sob o mesmo layout em `src/App.tsx`

Abordagem proposta

1. Separar o layout em dois ambientes
- Transformar o layout atual em dois layouts distintos:
  - `MainAppLayout`: menu principal
  - `MercadoLivreLayout`: menu exclusivo do ML
- Ambos reutilizam o mesmo `Header`

2. Tornar o Header configurável
- Adicionar uma prop no `Header`, algo como:
  - `showSellerSwitcher?: boolean`
- No ambiente principal: `true`
- No ambiente Mercado Livre: `false`
- Isso evita duplicar o header e mantém a mesma identidade visual

3. Separar a sidebar em duas navegações
- Extrair a navegação atual para componentes mais específicos:
  - `MainSidebar`: Dashboard, Vendas, Importação, Sellers, Integrações, Usuários + item “Mercado Livre”
  - `MercadoLivreSidebar`: Vendas, Estoque, Produtos, Pedidos, Anúncios + item “Voltar ao painel principal”
- Preservar o comportamento atual de colapso da sidebar

4. Reorganizar as rotas
- Em `src/App.tsx`, dividir as rotas protegidas em dois grupos:
  - Grupo com `MainAppLayout`
  - Grupo com `MercadoLivreLayout`
- Exemplo conceitual:
  - `/`, `/vendas-diarias`, `/importacao`, `/sellers`, `/usuarios`, `/integracoes`, `/perfil` → layout principal
  - `/mercado-livre`, `/mercado-livre/estoque`, `/mercado-livre/produtos`, `/mercado-livre/pedidos`, `/mercado-livre/anuncios` → layout ML

5. Ajustar títulos por ambiente
- Hoje o `AppLayout` centraliza os títulos via `routeTitles`
- Vou mover isso para uma estrutura reutilizável, para que ambos os layouts consigam resolver título/subtítulo corretamente sem duplicação desnecessária

Arquivos que devem ser envolvidos

- `src/App.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`

Provável criação de novos componentes
- `src/components/layout/MainAppLayout.tsx`
- `src/components/layout/MercadoLivreLayout.tsx`
- possivelmente:
  - `src/components/layout/MainSidebar.tsx`
  - `src/components/layout/MercadoLivreSidebar.tsx`

Detalhes de UX previstos

Ambiente principal
- Menu limpo, sem o grupo expansível do Mercado Livre
- Novo item dedicado “Mercado Livre” para entrar no ambiente ML

Ambiente Mercado Livre
- Sidebar só com itens do ML
- Item adicional “Voltar ao painel principal”
- Header igual ao atual, mas sem seller switcher
- Notificações e menu do usuário permanecem

Cuidados técnicos

- O `Header` hoje depende diretamente de `useSeller()`, então a mudança principal é desacoplar a renderização do alternador
- As páginas de Mercado Livre que já existem não parecem depender do seller selecionado, então a remoção do alternador no header não deve quebrar o fluxo
- As permissões atuais via `RoleRoute` e `canAccess()` podem continuar iguais; a mudança é estrutural/visual de layout, não de autorização

Plano de implementação

1. Criar dois layouts protegidos separados
2. Refatorar o `Header` para aceitar ocultação do alternador de seller
3. Dividir a sidebar em navegação principal e navegação ML
4. Adicionar o item dedicado “Mercado Livre” no ambiente principal
5. Adicionar o item “Voltar ao painel principal” no ambiente ML
6. Reorganizar as rotas em `App.tsx` para usar o layout correto por grupo
7. Validar títulos, estados ativos e colapso das sidebars
8. Revisar navegação entre ambientes e acesso por perfil

Resultado esperado

O usuário perceberá dois contextos claros dentro do mesmo produto:
- um ambiente operacional geral
- um ambiente dedicado ao Mercado Livre

Sem alterar o header visual, mas com a experiência do ML mais focada e sem o alternador de seller.
