

## Botão de configuração de cobertura no Estoque

Adicionar um botão **"Configurar cobertura"** na barra superior da página `/api/estoque`, ao lado do seletor de período (7/15/30 dias). Ao clicar, abre um popover que permite ao usuário definir os limiares (em dias) das classes **Ruptura**, **Crítico** e **Alerta** — substituindo os valores atualmente fixos em `useMLCoverage.ts` (`< 25% do horizonte = crítico`, `< 100% = alerta`).

### Fluxo visual

```text
[ 7d ] [ 15d ] [ 30d ]   [⚙ Configurar cobertura]   [Estoque|Relatórios]   [Atualizar]
                                ↓ click
                ┌────────────────────────────────────┐
                │ Configurar níveis de cobertura     │
                ├────────────────────────────────────┤
                │ Ruptura      Estoque = 0  (fixo)   │
                │ Crítico      abaixo de [ 7 ] dias  │
                │ Alerta       abaixo de [ 15] dias  │
                │ OK           a partir de 15 dias   │
                │                                    │
                │ [Restaurar padrão]   [Salvar]      │
                └────────────────────────────────────┘
```

### Regras

- **Ruptura** continua sendo determinada apenas por `available_quantity === 0` (não configurável).
- **Crítico**: `0 < coverage_days < criticoMax` (campo numérico, default = `ceil(period * 0.25)` → 8 para 30d).
- **Alerta**: `criticoMax ≤ coverage_days < alertaMax` (default = `period` → 30 para 30d).
- **OK**: `coverage_days ≥ alertaMax`.
- **Sem giro**: inalterado (sem vendas no período).
- Validação: `1 ≤ criticoMax < alertaMax ≤ 365`. Se inválido, botão Salvar fica desabilitado com mensagem inline.

### Persistência

Usar `localStorage` na chave `ml_coverage_thresholds` (mesma estratégia já adotada pelas metas — ver memory `tech/goals-persistence-state`):

```json
{ "criticoMax": 8, "alertaMax": 30 }
```

Carregado uma vez no mount do `MLEstoque`. Ao salvar, atualiza estado e o `localStorage` simultaneamente. Sem necessidade de tabela no Supabase (configuração estritamente local).

### Reatividade

Os limiares passam a ser **independentes do período de lookback** (atualmente derivados dele). O seletor 7/15/30 continua controlando apenas a janela de vendas usada para calcular `avg_daily_sales` e `coverage_days` — a classificação usa os thresholds salvos.

Toda a UI (KPIs, donut, buckets, tabela de urgência, badges, alertas de ruptura) recalcula automaticamente porque depende de `coverageMap`, que é derivado dos thresholds via `useMemo`.

### Arquivos afetados

1. **`src/hooks/useMLCoverage.ts`**
   - Adicionar tipo `CoverageThresholds = { criticoMax: number; alertaMax: number }`.
   - Aceitar terceiro argumento `thresholds` no hook (default mantém comportamento atual quando não fornecido, para retrocompatibilidade).
   - Substituir `classifyDays(period)` por `classifyDays(thresholds)`.

2. **`src/components/mercadolivre/CoverageSettingsPopover.tsx`** *(novo)*
   - `Popover` (shadcn) com trigger `<Button variant="outline" size="sm">` contendo ícone `Settings2` + label "Cobertura".
   - Dois `Input type="number"` para Crítico e Alerta.
   - Linha informativa fixa para Ruptura ("Estoque zerado").
   - Botões `Restaurar padrão` (recalcula a partir do período atual) e `Salvar`.
   - Props: `period`, `thresholds`, `onChange(next)`.

3. **`src/pages/mercadolivre/MLEstoque.tsx`**
   - Novo `useState<CoverageThresholds>` com hidratação do `localStorage` (lazy init).
   - `useEffect` salvando no `localStorage` quando muda.
   - Passar `thresholds` ao `useMLCoverage`.
   - Inserir `<CoverageSettingsPopover />` na sticky header, entre o seletor de período e `TabsList`.
   - Quando o usuário troca o período, NÃO sobrescreve thresholds salvos (apenas recalcula vendas).

### Detalhes técnicos

- Defaults iniciais (sem nada no `localStorage`): `criticoMax = ceil(period * 0.25)`, `alertaMax = period` — preserva visual atual no primeiro acesso.
- Componente `Settings2` do `lucide-react` (já disponível na lib).
- Popover com `align="end"` e `className="w-72"` para não atrapalhar o layout.
- Acessibilidade: labels associados aos inputs, ENTER no input dispara Salvar, ESC fecha o popover.

