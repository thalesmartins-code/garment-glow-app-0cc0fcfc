

## Analise Completa: Seguranca, Desempenho, Engenharia e Escalabilidade

### Estado Atual do Projeto

- **3 usuarios** ativos, **4 contas ML** conectadas
- **Banco de dados**: ~8 MB total, maior tabela `ml_product_daily_cache` com 12.6k rows (6 MB)
- **Indices compostos**: ja implementados em todas as tabelas de cache (correto)
- **Edge Functions**: 12 funcoes, JWT validado internamente, Zod em 4 funcoes
- **Code splitting**: lazy loading em 13 sub-rotas ML (correto)
- **QueryClient**: configurado com staleTime 5min (correto)

---

### 1. SEGURANCA — Problemas Encontrados

**CRITICO: access_token ainda exposto no frontend**
Apesar da refatoracao nas Edge Functions `mercado-libre-integration` e `ml-inventory`, o `access_token` ainda e lido pelo frontend em **5 arquivos**:
- `src/contexts/MLStoreContext.tsx` — busca `access_token` de `ml_tokens` e armazena no estado
- `src/contexts/HeaderScopeContext.tsx` — busca `access_token` de `ml_tokens`
- `src/pages/Integrations.tsx` — salva tokens no localStorage
- `src/pages/TVModeVendas.tsx` — busca `access_token` e envia para `ml-inventory`
- `src/hooks/useMLReputation.ts` — usa session token (ok, e JWT)

**O RLS de `ml_tokens` permite SELECT para o proprio usuario** — isto e o esperado, mas o frontend nao deveria mais precisar ler `access_token`. O campo deveria ser removido das queries do frontend.

**Audit log sem protecao de escrita** — confirmado pelo security scan. Qualquer usuario autenticado pode inserir/deletar registros de auditoria. A funcao `insert_audit_log` existe mas nao ha RLS bloqueando INSERT/DELETE direto.

**Sales data: editors podem escrever dados de qualquer seller** — RLS de INSERT/UPDATE/DELETE permite qualquer editor modificar dados de qualquer seller_id, nao apenas os proprios.

**Leaked Password Protection**: desabilitada (confirmado pelo linter).

**verify_jwt = false em TODAS as 12 Edge Functions** — o JWT e validado no codigo, o que e aceitavel, mas `verify_jwt = false` no gateway significa que requests sem token chegam ao codigo (overhead desnecessario e superficie de ataque maior).

**Tokens no localStorage** — `Integrations.tsx` salva access_token/refresh_token no localStorage, acessivel via XSS.

---

### 2. DESEMPENHO — Estado Atual

**Edge Functions**: tempos de execucao variam de 1s a 15s. `ml-inventory` chegou a 15.3s — proximo do timeout de 26s do Supabase Free tier.

**MercadoLivre.tsx reduzido a 555 linhas** (era 1672) — melhoria significativa, mas ainda tem ~15 `useMemo` e ~6 `useEffect` na mesma pagina, causando cascata de re-renders.

**React Query nao e usado nas paginas ML** — os hooks `useMLDataLoader` e `useMLSync` ainda usam `useState` + `useCallback` manuais. O `QueryClient` esta configurado mas nao e consumido.

**`ml_product_daily_cache` com limit 5000** — hardcoded no `mlCacheService.ts`. Com 12.6k rows atual para 3 usuarios, cada usuario novo com catalogo grande pode ultrapassar rapidamente.

**Sync duplicada**: `useEffect` na linha 121-132 sincroniza todo o estado (daily, hourly, products, mlUser) para `MLStoreContext` a cada mudanca — gera re-renders em cascata em toda a arvore.

---

### 3. ENGENHARIA DE SOFTWARE

**Positivo (ja implementado):**
- Camada de servico `mlCacheService.ts` centralizada
- Hooks separados (`useMLFilters`, `useMLDataLoader`, `useMLSync`)
- Componentes modularizados (`MLKPIGrid`, `MLRevenueChart`, etc.)
- Zod validation em 4 Edge Functions
- Server-side token lookup em 2 Edge Functions

**Pendente:**
- **Mock data misturado com dados reais** na mesma pagina (linhas 246-310) — dificil manter e testar
- **Sem testes** — apenas 1 test file (`example.test.ts`) com teste trivial
- **Sem error boundaries** — erro em qualquer componente ML derruba a pagina inteira
- **Types duplicados** — `DailyBreakdown` definido em `useMLDataLoader`, `DailyRow` em `mlCacheService`, mapeamento manual entre eles
- **`supabase as any`** usado em queries de `ml_hourly_cache` e `ml_sync_log` — indica tipos desatualizados

---

### 4. ESCALABILIDADE — Capacidade de Novos Usuarios

**Infraestrutura Lovable + Supabase (Free/Pro):**

| Recurso | Free Tier | Pro Tier ($25/mes) |
|---|---|---|
| Database | 500 MB | 8 GB |
| Edge Function invocations | 500k/mes | 2M/mes |
| Edge Function timeout | 26s (150s c/ upgrade) | 150s |
| Bandwidth | 5 GB | 250 GB |
| Concurrent connections | ~60 | ~200 |
| Realtime connections | 200 | 500 |

**Projecao de crescimento:**
- Cada usuario gera ~4.2k rows/mes em `ml_product_daily_cache` (12.6k / 3 usuarios)
- Com 50 usuarios: ~210k rows/mes, ~2.5M rows/ano = ~1.2 GB/ano apenas nessa tabela
- Com 100 usuarios: ~5M rows/ano = ~2.4 GB/ano — ultrapassa Free em ~2 meses

**Gargalos para escalar:**
1. **Edge Function timeout (26s)**: `ml-inventory` ja leva 15s para 1 usuario — impossivel para catalogos grandes
2. **Sem paginacao server-side**: limit 5000 vai quebrar com catalogos de 500+ produtos
3. **Sem rate limiting**: cada usuario pode disparar syncs ilimitados
4. **Sem queue/batch processing**: sync e sincrono — 10 usuarios sincronizando simultaneamente = 10 Edge Functions concorrentes = possivel throttling
5. **RLS queries escaneiam auth.uid() por row**: com milhoes de rows, queries ficam lentas sem indices adequados (indices ja existem, o que e bom)

---

### PLANO DE ACAO — 5 Fases

#### Fase 1: Seguranca Critica (imediata)
1. **Remover access_token do frontend**: limpar `MLStoreContext`, `HeaderScopeContext`, `TVModeVendas`, `Integrations.tsx` — frontend nunca mais le `access_token` de `ml_tokens`
2. **Remover tokens do localStorage**: usar apenas session do Supabase Auth
3. **Adicionar RLS restritivo ao audit_log**: bloquear INSERT/UPDATE/DELETE para usuarios normais
4. **Corrigir RLS de sales_data**: editors so podem escrever dados dos proprios sellers
5. **Habilitar Leaked Password Protection** no dashboard Supabase

#### Fase 2: Migrar para React Query (performance)
6. **Converter useMLDataLoader para useQuery**: eliminar useState/useCallback manuais, usar cache automatico
7. **Remover sync de estado para MLStoreContext**: consumir dados diretamente do React Query cache
8. **Separar mock data em provider dedicado**: remover logica de mock da pagina principal

#### Fase 3: Escalabilidade do Backend
9. **Paginacao server-side**: Edge Function que agrega `ml_product_daily_cache` e retorna top N por periodo
10. **Queue de sync**: implementar debounce/throttle no backend (Supabase pg_cron ou Edge Function com lock)
11. **Otimizar ml-inventory**: paginar em chunks menores, cache de items no banco para evitar re-fetch

#### Fase 4: Robustez
12. **Error Boundaries** nos componentes ML
13. **Unificar tipos**: single source of truth para `DailyBreakdown`/`DailyRow`
14. **Remover `as any`** — atualizar types.ts ou usar `.rpc()` tipado
15. **Habilitar verify_jwt = true** nas Edge Functions que ja validam JWT internamente

#### Fase 5: Preparacao Comercial
16. **Multi-tenancy com organization_id** — filtrar dados por org, nao por user
17. **Plano de banco**: migrar para Supabase Pro quando atingir 20+ usuarios
18. **Monitoring**: usar `get_cache_table_stats()` em dashboard admin para acompanhar crescimento

---

### Detalhes Tecnicos

**Arquivos a modificar (Fase 1):**
- `src/contexts/MLStoreContext.tsx` — remover `access_token` do tipo e queries
- `src/contexts/HeaderScopeContext.tsx` — remover `access_token` da interface `ScopeToken`
- `src/pages/TVModeVendas.tsx` — usar `ml_user_id` em vez de `access_token`
- `src/pages/Integrations.tsx` — remover localStorage de tokens
- Migration SQL: RLS policies para `audit_log` e `sales_data`

**Estimativa de capacidade apos otimizacoes:**
- Free tier: ate ~20-30 usuarios confortavelmente
- Pro tier ($25/mes): ate ~200 usuarios
- Pro + read replicas: ate ~1000 usuarios
- Alem disso: necessario Supabase Enterprise ou arquitetura com queue

