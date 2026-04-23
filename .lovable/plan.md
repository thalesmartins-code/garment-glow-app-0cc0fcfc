
## Loader global em tela cheia (sem piscar o menu)

### Problema
Ao entrar em qualquer rota autenticada, o `LayoutShell` (sidebar + header) é renderizado imediatamente, e só depois o `OrganizationContext` termina de carregar — gerando o efeito de "piscante" onde o menu aparece, some, e o conteúdo encaixa. O loader atual em `OrgSettings` só centra o spinner dentro do shell já visível, não resolve a causa.

### Solução
Bloquear toda a renderização do `LayoutShell` (sidebar, header, conteúdo) enquanto a organização ainda está carregando. No lugar, mostrar o `PageLoader` existente em tela cheia. Quando `loading` virar `false`, o app inteiro aparece de uma vez, sem flashes intermediários.

### Mudanças

**1. `src/components/layout/LayoutShell.tsx`**
- Importar `useOrganization` e `PageLoader`.
- Antes de qualquer JSX, checar `loading` da organização.
- Se `loading === true`, retornar `<PageLoader />` ocupando a viewport inteira — nada de sidebar, header ou Outlet.
- Caso contrário, renderizar o layout normal como hoje.

**2. `src/pages/org/OrgSettings.tsx`**
- Remover o bloco `if (loading) return <Loader2 ... />` — agora redundante, já que o `LayoutShell` segura tudo antes.
- Manter apenas o fallback `if (!currentOrg)` para "Nenhuma organização selecionada".

### Resultado
```text
Antes:                              Depois:
┌──────────────────────────┐        ┌──────────────────────────┐
│ Sidebar │  Header        │        │                          │
│  menu   ├────────────────┤   →    │           ◐              │
│  itens  │      ◐         │        │      Carregando...       │
│ (pisca) │   (centra)     │        │      (tela cheia)        │
└──────────────────────────┘        └──────────────────────────┘
```

### Notas técnicas
- `PageLoader` (`src/components/ui/PageLoader.tsx`) já existe com `min-h-screen` centralizado e animação do logo — reutilizado sem criar componente novo.
- O gate fica no `LayoutShell` (wrapper de todas as rotas autenticadas via `App.tsx`), então o efeito é consistente em qualquer rota, não só `/api/organizacao`.
- `ProtectedRoute` continua à frente cuidando do gate de autenticação; este loader cobre apenas a janela "autenticado mas org ainda não carregada".
- Sem mudanças em contextos, rotas ou lógica de dados.
