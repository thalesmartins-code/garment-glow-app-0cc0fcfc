

## Diagnóstico e Plano: Sincronização com dias faltantes + Registro de sincronização

### Problema identificado

Após análise minuciosa do código, identifiquei **3 causas raiz** para dias faltando intermitentemente:

1. **Inconsistência de timezone nas datas**: Na `syncFromAPI`, `fromDateStr` e `toDateStr` usam `toISOString().substring(0,10)` (que converte para UTC), mas os chunks usam `format(chunkStart, "yyyy-MM-dd")` (que usa horário local/BRT). Se o fuso do navegador não for exatamente UTC-3, as datas podem divergir em 1 dia.

2. **Dados de visitas "vazam" entre chunks**: A Edge Function busca visitas com a API `items_visits/time_window` que pode retornar datas fora do range do chunk. Quando o chunk seguinte roda, ele faz upsert para a mesma data mas sem as visitas do chunk anterior — sobrescrevendo com dados incompletos.

3. **`loadFromCache` sem filtro de data**: Carrega as últimas 1000 linhas do `ml_daily_cache` sem filtrar pelo período selecionado. Se o usuário tiver muitos dados históricos, datas antigas podem empurrar as mais recentes para fora do limite de 1000.

### Plano de implementação

#### 1. Corrigir a sincronização (MercadoLivre.tsx)
- Usar `format()` do date-fns de forma consistente em vez de `toISOString().substring(0,10)` para eliminar divergência de timezone
- Mudar `SYNC_CHUNK_DAYS` de 2 para **1** (chunk diário) — isso elimina completamente o problema de sobreposição de datas entre chunks e é mais seguro para sellers de alto volume
- Adicionar filtro de data em `loadFromCache` usando `.gte("date", fromDate).lte("date", toDate)` para evitar o limite de 1000 linhas

#### 2. Criar tabela `ml_sync_log` (migration)
Nova tabela para registrar cada sincronização realizada:

```text
ml_sync_log
├── id (uuid, PK)
├── user_id (uuid, NOT NULL)
├── ml_user_id (text, NOT NULL)
├── date_from (date, NOT NULL)
├── date_to (date, NOT NULL)
├── days_synced (integer, NOT NULL)
├── orders_fetched (integer, DEFAULT 0)
├── source (text: 'auto' | 'manual' | 'historical')
├── synced_at (timestamptz, DEFAULT now())
```

Com unique constraint em `(user_id, ml_user_id, date_from, date_to)` para upsert e RLS igual às demais tabelas ML (user can CRUD own rows).

#### 3. Registrar sincronizações na Edge Function
Após salvar os dados no cache, inserir/atualizar um registro no `ml_sync_log` com o range sincronizado e a contagem de pedidos.

#### 4. Registrar sincronizações no frontend (Historical Sync)
O `HistoricalSyncModal` também salva no `ml_sync_log` após cada chunk importado com sucesso, com `source = 'historical'`.

#### 5. Exibir cobertura de sincronização no cabeçalho (MLPageHeader)
- Adicionar badge/texto abaixo de "Última sinc" mostrando os períodos sincronizados
- Consultar `ml_sync_log` para o usuário e loja selecionada
- Exibir de forma compacta, ex: `Sincronizado: 20/03 a 27/03 (auto) · Jan-Mar 2026 (histórico)`
- Tooltip com detalhes ao passar o mouse (data da sinc, pedidos, etc.)

### Arquivos afetados
- `src/pages/MercadoLivre.tsx` — fix de timezone, chunk diário, filtro de data no cache
- `supabase/functions/mercado-libre-integration/index.ts` — salvar no `ml_sync_log`
- `src/components/mercadolivre/HistoricalSyncModal.tsx` — salvar no `ml_sync_log`
- `src/components/mercadolivre/MLPageHeader.tsx` — exibir cobertura de sinc
- Nova migration SQL — criar tabela `ml_sync_log` com RLS

