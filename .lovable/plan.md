

## Diagnóstico da Divergência

### Causa Raiz Identificada

A função `fetchOrdersChunk` tem **dois limitadores** que truncam os pedidos:

1. **`maxOrders = 5000`** — cada chunk de 7 dias busca no máximo 5.000 pedidos
2. **`offset < 10000`** — limite da API do ML (máximo ~10.000 pedidos por consulta de busca)

Seu seller faz ~3.370 pedidos/dia. Em um chunk de 7 dias, isso equivale a ~23.000 pedidos, mas apenas 5.000 são buscados. Como a API retorna `sort=date_desc`, os pedidos mais antigos do chunk são descartados silenciosamente.

**Por que o valor cai a cada sync:** A API do ML pode retornar pedidos em ordem ligeiramente diferente entre chamadas. O cap de 5.000 corta pedidos diferentes a cada execução, e o upsert sobrescreve o cache com os novos valores (menores).

### Plano de Correção

#### 1. Reduzir chunk de 7 dias para 1 dia

Em `supabase/functions/mercado-libre-integration/index.ts`:
- Alterar `CHUNK_DAYS` de `7` para `1`
- Cada chunk cobrirá exatamente 24h, garantindo que os ~3.370 pedidos/dia fiquem dentro do limite

#### 2. Aumentar `maxOrders` para 15.000

- Alterar o default de `maxOrders` de `5000` para `15000` no `fetchOrdersChunk`
- Margem de segurança para dias de pico (Black Friday, etc.)

#### 3. Log de truncamento para diagnóstico

- Após a paginação, logar se `paging.total` era maior que o número de pedidos efetivamente buscados
- Isso permite detectar futuramente se o limite foi atingido

#### 4. Redeploy da Edge Function

- Deploy automático após edição do arquivo

### Impacto

- Chunk de 1 dia para 30 dias = 30 chamadas sequenciais (vs. 5 antes), mas cada uma é pequena e rápida
- Sem risco de WORKER_LIMIT pois cada chunk processa poucos pedidos
- Os valores do cache passarão a refletir 100% dos pedidos de cada dia

### Riscos e Mitigações

- **Tempo de execução maior:** 30 chunks vs 5, mas cada chunk tem paginação muito menor (~68 páginas vs ~100). Tempo total deve ser similar ou menor.
- **Rate limiting ML API:** Com ~68 chamadas por chunk × 30 chunks = ~2.040 chamadas. Pode ser necessário adicionar um pequeno delay entre chunks se o ML retornar 429.

