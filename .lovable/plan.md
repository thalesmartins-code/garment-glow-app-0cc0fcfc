

## Plano: Reestruturar cards de KPI na página Vendas

### Resumo

Juntar o card "GAP" com o card "% da meta" em um unico card, e criar um novo card "% Meta vs PMT Acum." que mostra a porcentagem da meta atingida considerando apenas os dias ate o dia atual (baseado no PMT acumulado).

### O que muda

**Row 1 — Card 3: "% da meta" passa a incluir o GAP**
- Mantém o valor principal como `% da meta` (ex: 85.3%)
- Adiciona o GAP como informação secundária abaixo (ex: "GAP: R$ -12.500" ou "GAP: R$ +5.000"), com cor verde/vermelha conforme positivo/negativo
- Mantém a barra de progresso existente

**Row 2 — Novo card: "% Meta vs PMT Acum."**
- No lugar do antigo card GAP
- Calcula: soma das vendas até o dia atual / soma das metas até o dia atual (proporcional ao PMT acumulado)
- Exemplo: se o PMT acumulado até dia 15 é 52%, a meta proporcional é 52% da meta total. Se vendemos R$ 60k de uma meta proporcional de R$ 52k, o atingimento é 115.4%
- Usa barra de progresso e cores (verde >= 100%, amarelo >= 80%, vermelho < 80%)
- Na visão diária, mostra o mesmo cálculo até D-1

### Alterações técnicas

1. **`src/pages/DailySales.tsx`**
   - Adicionar no `metrics` o cálculo de `metaVsPmtAcum`: filtra dias até hoje (ou até D-1 no modo diário), soma vendaTotal e metaVendas desses dias, calcula a porcentagem
   - Card "% da meta" (Row 1, posição 3): adicionar prop `subtitle` com o texto do GAP formatado e colorido
   - Substituir o card GAP (Row 2, posição 1) pelo novo card "% Meta vs PMT Acum."

2. **`src/components/dashboard/KPICard.tsx`**
   - Adicionar suporte a `subtitleNode` (ReactNode) para permitir texto colorido no subtitle (para o GAP com cor dinâmica)

