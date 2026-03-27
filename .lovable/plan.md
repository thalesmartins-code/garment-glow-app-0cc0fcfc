

## Plano: Multi-loja ML no seletor de marketplace + renomear lojas em Integrações

### Contexto
Atualmente o `MarketplaceSwitcher` mostra "Mercado Livre" como uma entrada única. O `MLStoreContext` já suporta múltiplas lojas (via `ml_tokens` + `ml_user_cache`), mas o seletor de marketplace do header não reflete isso. Além disso, não há funcionalidade para renomear lojas na página de integrações.

### O que será feito

1. **Adicionar coluna `custom_name` à tabela `ml_user_cache`** — nova migração adicionando um campo `custom_name TEXT` que armazena o nome personalizado definido pelo usuário para cada loja.

2. **Expandir o MarketplaceSwitcher para mostrar múltiplas lojas ML** — quando houver mais de uma loja ML conectada, o dropdown listará cada loja individualmente (ex: "ML - Loja Principal", "ML - Loja 2") em vez de um único item "Mercado Livre". Cada sub-loja terá o ícone ML com gradiente amarelo. Se houver apenas uma loja ML, mantém o comportamento atual.

3. **Integrar MLStoreContext no MarketplaceSwitcher** — o componente consumirá `useMLStore()` para obter a lista de lojas e sincronizar a seleção com o `selectedStore` do contexto ML quando um sub-item ML for selecionado.

4. **Adicionar funcionalidade de renomear lojas na página de Integrações** — dentro do card do Mercado Livre, quando conectado com múltiplas lojas, exibir uma lista das lojas conectadas com um botão de edição (ícone lápis). Ao clicar, abre um inline edit ou dialog para definir o `custom_name`. O nome é salvo via `UPDATE` na `ml_user_cache`.

5. **Atualizar MLStoreContext** — incluir `custom_name` no tipo `MLStore` e na query de fetch, priorizando `custom_name` sobre `nickname` para exibição.

### Detalhes técnicos

**Migração SQL:**
```sql
ALTER TABLE public.ml_user_cache ADD COLUMN IF NOT EXISTS custom_name TEXT;
```

**Arquivos modificados:**
- `supabase/migrations/new_migration.sql` — adicionar `custom_name`
- `src/contexts/MLStoreContext.tsx` — adicionar `custom_name` ao tipo `MLStore`, buscar na query, priorizar na exibição
- `src/components/layout/MarketplaceSwitcher.tsx` — consumir `useMLStore()`, renderizar sub-itens ML quando houver múltiplas lojas, sincronizar seleção
- `src/pages/Integrations.tsx` — adicionar seção de lojas conectadas no card ML com edição inline de nome (input + botão salvar)
- `src/components/mercadolivre/MLStoreSelector.tsx` — usar `custom_name || nickname` para label

**Fluxo de renomeação:**
1. Usuário vai em Integrações → card ML → vê lista de lojas conectadas
2. Clica no ícone de editar ao lado do nome da loja
3. Input inline aparece com o nome atual
4. Usuário digita novo nome e confirma
5. `UPDATE ml_user_cache SET custom_name = '...' WHERE user_id = uid AND ml_user_id = '...'`
6. `MLStoreContext.refresh()` é chamado para atualizar globalmente

