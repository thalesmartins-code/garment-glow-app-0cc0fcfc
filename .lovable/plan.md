

# Padronização de cabeçalhos + Limpeza de páginas

Padronizar os cabeçalhos das páginas internas seguindo o padrão já consolidado em **Vendas / Anúncios / Estoque / Sellers**, e remover totalmente as páginas **Sincronizações** e **Importação**.

## Padrão de cabeçalho (referência)

```tsx
<div className="flex items-start justify-between gap-4 pt-1 pb-4">
  <div>
    <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      Título
    </h1>
    <p className="text-sm text-muted-foreground mt-0.5">
      Subtítulo descritivo curto.
    </p>
  </div>
  {/* Ações à direita (botões, badges) — opcional */}
</div>
```

## Páginas a padronizar

| Página | Ícone | Título | Subtítulo | Ação à direita |
|---|---|---|---|---|
| `MLMetas.tsx` | `Target` | Metas | Defina metas mensais por loja e acompanhe no dashboard de Vendas. | Botão **Salvar** (mantido) |
| `Sellers.tsx` | `Store` | Sellers | Gerencie seus sellers e suas respectivas lojas por marketplace. | Botão **Novo Seller** (já alinhado, só revisar tipografia para `text-xl`) |
| `Profile.tsx` | `UserCircle` | Perfil | Atualize suas informações pessoais e foto de avatar. | — |
| `UserManagement.tsx` | `Users` | Gestão de Usuários | Administre usuários, permissões e visibilidade do menu. | Botão **Novo Usuário** |
| `AdminMonitoring.tsx` | `Activity` | Monitoramento | Estatísticas de banco de dados, capacidade e organizações ativas. | Botão **Atualizar** + texto "Última atualização" abaixo do subtítulo |

Em **Metas**, remover o `max-w-3xl mx-auto` para alinhar com a largura padrão das demais páginas. Em **Profile**, remover o card-wrapper com título "Meu Perfil" (passa a ser cabeçalho da página) e manter o conteúdo (avatar + form) num único `Card` sem header redundante.

## Remoções

### Páginas/arquivos deletados
- `src/pages/mercadolivre/MLSincronizacoes.tsx`
- `src/pages/mercadolivre/MLImportacao.tsx`
- `src/components/import/marketplace/` (pasta inteira: `FileUploadCard`, `MarketplaceSelector`, `ImportPreviewTable`, `ImportOrdersPreviewTable`)
- `src/utils/marketplaceParsers.ts`
- `src/utils/csvParser.ts`
- `src/types/import.ts`

### Referências limpas
- `src/App.tsx` — remover lazy imports e rotas `/api/sincronizacoes` e `/api/importacao`.
- `src/components/layout/routeMeta.ts` — remover entradas das duas rotas.
- `src/components/layout/Header.tsx` — remover itens do menu da conta "Importação" e "Sincronizações" (e ícones `Upload`, `DatabaseZap` se ficarem órfãos).
- `src/components/layout/LayoutShell.tsx` — remover `/api/importacao` de `HIDE_SELLER_SWITCHER_ROUTES`.
- `src/config/roleAccess.ts` — remover entradas `/api/sincronizacoes` e `/api/importacao`.
- `src/components/layout/Sidebar.tsx` (legado `/sheets`) — remover item "Importação" se ainda estiver listado.

## Detalhes técnicos

- Manter o hook `useMLSync` e a tabela `ml_sync_log` (usados pelo indicador de sincronização no header — não está atrelado à página removida).
- Não mexer em `shopee_sales` / `shopee_orders` (mencionado em conversas anteriores como a manter).
- Atualizar `mem://style/standardized-headers` adicionando que Metas, Sellers, Perfil, Gestão de Usuários e Monitoramento agora seguem o padrão `pt-1 pb-4` com ícone `h-5 w-5 text-primary`.
- Atualizar `mem://features/mercado-livre/placeholder-routes` removendo qualquer menção a Sincronizações/Importação.

## Arquivos editados

- `src/pages/mercadolivre/MLMetas.tsx`
- `src/pages/Sellers.tsx` (revisão fina)
- `src/pages/Profile.tsx`
- `src/pages/UserManagement.tsx`
- `src/pages/AdminMonitoring.tsx`
- `src/App.tsx`
- `src/components/layout/routeMeta.ts`
- `src/components/layout/Header.tsx`
- `src/components/layout/LayoutShell.tsx`
- `src/config/roleAccess.ts`
- `src/components/layout/Sidebar.tsx`

## Arquivos deletados

- `src/pages/mercadolivre/MLSincronizacoes.tsx`
- `src/pages/mercadolivre/MLImportacao.tsx`
- `src/components/import/marketplace/*` (4 arquivos)
- `src/utils/marketplaceParsers.ts`
- `src/utils/csvParser.ts`
- `src/types/import.ts`

