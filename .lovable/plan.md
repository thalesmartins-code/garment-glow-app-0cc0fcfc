

## Bubble Chart — Hora × Dia da Semana

Adicionar uma nova aba **"Bubble"** na página Vendas por Hora com um scatter/bubble chart usando Recharts.

### Conceito

```text
        Dom   Seg   Ter   Qua   Qui   Sex   Sáb
  00h    ·     ·     ·     ·     ·     ·     ·
  06h    ·     ○     ·     ○     ·     ·     ·
  10h    ○     ●     ◉     ●     ◉     ○     ·
  14h    ◉     ◉     ◉     ◉     ◉     ●     ○
  20h    ●     ○     ●     ○     ○     ·     ·
```

- Eixo X = dia da semana (Dom–Sáb)
- Eixo Y = hora (0–23)
- Tamanho da bolha = volume de receita
- Cor da bolha = marketplace (com as cores de marca já definidas)
- Bolhas de marketplaces diferentes no mesmo slot ficam levemente deslocadas para evitar sobreposição total
- Tooltip mostra marketplace, dia, hora e valor formatado em BRL

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/mercadolivre/HourlyBubbleChart.tsx` | Criar — ScatterChart do Recharts com ZAxis para tamanho das bolhas, 7 séries (uma por marketplace) |
| `src/pages/mercadolivre/VendasPorHora.tsx` | Adicionar 5ª aba "Bubble" com ícone Circle, importar HourlyBubbleChart |

### Detalhes técnicos

- Usar `ScatterChart` + `Scatter` + `ZAxis` do Recharts (já instalado)
- Cada marketplace é um `<Scatter>` separado com sua cor de marca
- ZAxis mapeia receita para range de tamanho [40, 400] pixels
- Dados agregados por dia da semana (não por data específica) para mostrar padrão semanal médio
- XAxis com ticks customizados mostrando Dom/Seg/Ter/Qua/Qui/Sex/Sáb
- YAxis invertido (0h no topo, 23h embaixo) para leitura natural

