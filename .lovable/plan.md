

## Barra de progresso durante sincronização

### O que será feito

Adicionar uma barra de progresso visível no topo da página do Mercado Livre que aparece durante a sincronização, mostrando o progresso chunk-a-chunk (ex: "Sincronizando 3/7 dias...").

### Como funciona

Atualmente a sincronização itera chunks diários em um loop `while` (linhas 556-582). Vamos:

1. **Calcular total de chunks antes do loop** — número total de iterações (dias × lojas)
2. **Novo estado `syncProgress`** — `{ current: number, total: number, label: string } | null`
3. **Atualizar a cada chunk** — incrementar `current` e atualizar `label` com a data sendo processada
4. **Exibir barra de progresso** — componente `Progress` (já existe em `src/components/ui/progress.tsx`) fixo no topo do conteúdo, com animação de entrada/saída via `AnimatePresence` (já importado)

### Mudanças técnicas

**Arquivo: `src/pages/MercadoLivre.tsx`**

- Novo state: `const [syncProgress, setSyncProgress] = useState<{current: number; total: number} | null>(null)`
- Antes do loop de chunks: calcular `totalChunks` (número de dias × número de lojas)
- Dentro do loop: `setSyncProgress({ current: ++chunksDone, total: totalChunks })`
- Após o loop: `setSyncProgress(null)`
- No JSX, acima dos KPIs: renderizar uma barra `Progress` com `value={(syncProgress.current / syncProgress.total) * 100}` envolvida em `AnimatePresence` para fade in/out
- Texto auxiliar: "Sincronizando dia X de Y..." com ícone de loading

### Visual

```text
┌──────────────────────────────────────────────┐
│ ⟳ Sincronizando 3 de 7 dias...              │
│ ████████████░░░░░░░░░░░░░░░  43%            │
└──────────────────────────────────────────────┘
```

Aparece com fade-in ao iniciar e fade-out ao concluir. Usa o componente `Progress` existente com cor primary.

