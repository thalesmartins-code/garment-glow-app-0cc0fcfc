# Melhoria de responsividade — Mobile e Tablet

Foco: header global, `SellerMarketplaceBar`, `StoreGroupSelector` e as toolbars internas das páginas Vendas, Anúncios, Estoque, Metas e Perfil. Hoje, em telas <768px (e em vários casos <1024px), os elementos quebram em várias linhas, ficam apertados ou estouram horizontalmente.

## Problemas identificados

**Header global (`Header.tsx`)**
- Mostra simultaneamente: `OrganizationSwitcher` + `SellerMarketplaceBar` (com chips de lojas) + `Seller Switcher` (dropdown) + sino + avatar/usuário. Em mobile vira 2–3 linhas e o título da página some.
- Há 2 seletores de seller (a barra e o dropdown) — redundante já no desktop e crítico no mobile.

**`SellerMarketplaceBar` + `StoreGroupSelector`**
- Os chips das lojas usam `flex-wrap`, o que empurra o conteúdo para baixo no header e quebra o layout.
- Em tablet, a barra inteira disputa espaço com tabs e period picker.

**Toolbars internas (Vendas / Anúncios / Estoque / Metas / Perfil)**
- Padrão repetido: `sticky` com `flex items-center justify-between` segurando título à esquerda e (TabsList + Botão TV + PeriodPicker + Sync) à direita.
- Em <1024px o lado direito quebra em múltiplas linhas, sobrepõe o título e o `TabsList` fica espremido.
- Period picker (`MLPeriodPicker`) tem label "Período:" + ícone + texto + chevron — muito largo no mobile.
- KPI grids já são responsivos, mas charts/cards não têm `min-w-0` e podem causar overflow horizontal.

## Plano de implementação

### 1. Header global (`src/components/layout/Header.tsx`)
- Esconder `OrganizationSwitcher` em <md (acessível via menu da conta) — manter apenas o avatar do usuário, sino e botão de menu mobile.
- Mover `SellerMarketplaceBar` para BAIXO do header em mobile/tablet (fica numa segunda faixa horizontal scrollável apenas quando necessário). No desktop continua inline.
- Remover o segundo dropdown de seller redundante em <md (a barra já permite trocar). Manter no desktop por compatibilidade.
- Avatar: ocultar bloco `<div>` com nome/role em <sm (já é o caso) e garantir o trigger não cresça.

### 2. `SellerMarketplaceBar` (`src/components/layout/SellerMarketplaceBar.tsx`)
- Trocar `flex-wrap` do container por scroll horizontal em mobile: `overflow-x-auto no-scrollbar` com `flex-nowrap`.
- Reduzir paddings em mobile (`px-1.5 py-1`) e diminuir min-width do trigger (`min-w-0`).
- Quando `showStores` e há muitas lojas: mostrar máximo de 2 chips e um botão "+N" que abre um popover com a lista completa em <md.

### 3. `StoreGroupSelector` (`src/components/layout/StoreGroupSelector.tsx`)
- Manter chips, mas envolver em `overflow-x-auto no-scrollbar flex-nowrap` em mobile (sem wrap).
- Em <md, o chip "Todas" fica fixo (sticky left) e os demais rolam.
- Adicionar utilitário `.no-scrollbar` em `src/index.css`.

### 4. Toolbars das páginas

Padrão novo aplicado a Vendas, Anúncios e Estoque:

```text
Mobile (<md):                    Desktop (≥md):
┌──────────────────────────┐     ┌─────────────────────────────────┐
│ Título            [⋯]    │     │ Título     Tabs   TV  Período  │
├──────────────────────────┤     └─────────────────────────────────┘
│ Tabs (scroll)   Período  │
└──────────────────────────┘
```

- Título numa linha sozinha em <md; ações em segunda linha com `flex-wrap` controlado.
- `TabsList` ganha `overflow-x-auto no-scrollbar` para não espremer.
- Botão "Modo TV" e "Sincronizar" colapsam para apenas ícone (`size-icon`) em <sm, com `aria-label`.
- `MLPeriodPicker`: ocultar label "Período:" em <sm, manter só ícone + texto.

**Páginas afetadas**
- `src/pages/MercadoLivre.tsx` (Vendas) — toolbar nas linhas 389–417.
- `src/pages/mercadolivre/MLAnuncios.tsx` — header (linhas 140–168) + barra de quick ranges (171–183) que precisa scroll horizontal em mobile.
- `src/pages/mercadolivre/MLEstoque.tsx` — toolbar nas linhas 1049–1078; `TabsList` interna 854–861 ganha scroll.
- `src/pages/mercadolivre/MLMetas.tsx` — toolbar 163–164: empilhar selects de Loja/Ano/Mês em coluna no mobile (`flex-col sm:flex-row gap-2`).
- `src/pages/Profile.tsx` — header simples, apenas garantir `flex-col sm:flex-row` e padding correto; conteúdo do card já se adapta.

### 5. Conteúdo geral
- Adicionar `min-w-0` nos containers grid das páginas para evitar overflow de tabelas/charts (sintoma comum de scroll horizontal indesejado na página inteira).
- Tabelas largas (campanhas em Anúncios, produtos em Estoque) já têm `overflow-x-auto` no wrapper — manter.
- KPI grids: já usam `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` — manter.

### 6. Utilitário CSS
Adicionar em `src/index.css`:
```css
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

## Arquivos a editar

1. `src/index.css` — utilitário `.no-scrollbar`.
2. `src/components/layout/Header.tsx` — esconder switchers redundantes em mobile, mover bar.
3. `src/components/layout/LayoutShell.tsx` — renderizar `SellerMarketplaceBar` em faixa abaixo do header em mobile/tablet quando `showSellerMarketplaceBar=true`.
4. `src/components/layout/SellerMarketplaceBar.tsx` — scroll horizontal, paddings reduzidos.
5. `src/components/layout/StoreGroupSelector.tsx` — flex-nowrap + scroll em mobile.
6. `src/components/mercadolivre/MLPeriodPicker.tsx` — esconder label "Período:" em <sm.
7. `src/components/mercadolivre/MLPageHeader.tsx` — permitir título quebrar para coluna em mobile (`flex-col sm:flex-row`, `items-start sm:items-center`).
8. `src/pages/MercadoLivre.tsx` — toolbar responsiva (Vendas).
9. `src/pages/mercadolivre/MLAnuncios.tsx` — toolbar + quick ranges com scroll.
10. `src/pages/mercadolivre/MLEstoque.tsx` — toolbar + TabsList com scroll.
11. `src/pages/mercadolivre/MLMetas.tsx` — selects empilhados em mobile.
12. `src/pages/Profile.tsx` — pequenos ajustes de padding/empilhamento.

## QA
Testar nos breakpoints 360, 414, 768, 834 e 1024px após a implementação:
- Vendas, Anúncios, Estoque, Metas, Perfil — verificar que header não quebra em ≥3 linhas, que tabs/period picker não se sobrepõem ao título, e que não há scroll horizontal na página principal.