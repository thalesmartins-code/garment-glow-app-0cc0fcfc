## Problema

Sempre que você sai da aba e volta (ou minimiza/restaura a janela), o app inteiro mostra "Carregando…" e refaz todas as requisições. Isso deixa a navegação lenta e gasta requisições à toa.

## Causa raiz

O Supabase faz refresh automático do token de autenticação em background. Quando você volta para a aba, ele dispara o evento `TOKEN_REFRESHED` no `onAuthStateChange` (em `src/contexts/AuthContext.tsx`). O handler atual roda **sempre** dois `setState`:

```ts
setSession(session);          // nova referência
setUser(session?.user ?? null); // nova referência (mesmo userId!)
```

Mesmo sendo o **mesmo usuário**, o objeto `user` muda de referência. Isso provoca uma cascata:

1. `OrganizationContext` tem `useEffect([user, loadOrgs])` → re-executa `loadOrgs`, marca `loading=true`, refaz query de organizações + permissões.
2. `LayoutShell` observa `orgLoading` e renderiza `<PageLoader />` no lugar do conteúdo (causa o "Carregando…" de tela cheia).
3. `MLStoreContext`, `HeaderScopeContext`, `SellerContext` etc. dependem de `user`/`currentOrg` → também recarregam stores, sales cache, etc.
4. Ao voltar o `loading=false`, todas as páginas remontam e o React Query refaz fetches.

Não é o `refetchOnWindowFocus` (já está `false`) — é o ciclo de auth + contextos que se reinicia.

Há também um listener manual em `OrgMembersTab.tsx` (`visibilitychange`) que refaz fetch ao voltar à aba, contribuindo no mesmo problema na tela de membros.

## Solução

### 1. `AuthContext.tsx` — ignorar eventos de auth que não mudam o usuário

No callback do `onAuthStateChange`, só atualizar `session`/`user` quando algo realmente mudou. Ignorar especificamente `TOKEN_REFRESHED` e `USER_UPDATED` quando o `user.id` continua o mesmo (apenas atualizar a `session` silenciosamente, sem trocar a referência do `user`):

- Manter `setSession(session)` (necessário para o token novo).
- Só chamar `setUser(...)` se o `user.id` mudou de fato (login/logout/troca de conta).
- Não chamar `fetchUserData` em refresh de token (o role/profile não mudaram).
- Tratar `INITIAL_SESSION` para não duplicar com o `getSession()` inicial.

Isso isola o refresh de token do resto do app.

### 2. `OrganizationContext.tsx` — depender do `user.id`, não do objeto `user`

Trocar `useEffect([user, loadOrgs])` por algo dependente apenas do **id** do usuário (`user?.id`). Mesmo que o item 1 já resolva, isso é uma defesa extra e barata.

Mesma coisa para o `useEffect` de `loadViewerPermissions`: depender de `user?.id` + `currentOrg?.id` + `currentOrg?.role`, não dos objetos completos.

### 3. `LayoutShell.tsx` — não tampar o conteúdo durante reloads silenciosos

Hoje qualquer `orgLoading=true` substitui a tela inteira por `<PageLoader />`. Mudar para mostrar o loader apenas no **primeiro carregamento** (quando ainda não há `currentOrg`). Em reloads subsequentes, manter o conteúdo atual visível e deixar cada página gerenciar seu próprio estado de loading.

### 4. `OrgMembersTab.tsx` — remover refetch em `visibilitychange`

Remover o listener manual de `visibilitychange` que força refetch ao voltar à aba. O React Query já controla cache e o usuário pode atualizar manualmente se quiser.

## Arquivos afetados

- `src/contexts/AuthContext.tsx` — handler do `onAuthStateChange` mais inteligente.
- `src/contexts/OrganizationContext.tsx` — dependências dos `useEffect` por id.
- `src/components/layout/LayoutShell.tsx` — não bloquear UI em reloads silenciosos.
- `src/components/org/OrgMembersTab.tsx` — remover listener de `visibilitychange`.

## Resultado esperado

- Sair e voltar para a aba: **nada acontece** visualmente. O token é renovado em background sem piscar telas.
- Minimizar/restaurar a janela: igual, sem reload.
- Login/logout/troca real de organização: continuam funcionando normalmente, mostrando loader quando apropriado.
- Performance percebida muito melhor; sem chamadas desnecessárias à Edge Functions e ao Supabase.
