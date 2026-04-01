

## Refatorar RevenueByMarketplace: Barra resumida + Expandir para detalhes

### O que muda

**Estado minimizado (padrão):** Uma única barra horizontal segmentada mostrando a proporção de faturamento de cada marketplace por cor, com o total ao lado. Clicável.

**Estado expandido (ao clicar):** Mostra o detalhamento atual com barras por marketplace e por loja, com barras alinhadas à margem esquerda (remover `min-w-[100px]` dos labels, usar layout fixo com grid ou widths fixos para que as barras comecem todas no mesmo ponto).

```text
MINIMIZADO:
┌─────────────────────────────────────────────────────┐
│ ▸ Faturamento por Marketplace    R$ 87.200          │
│   ██████████████████████████░░░░░░░░░░░░░░░░░░░░░░  │
│   (segmentos coloridos proporcionais)               │
└─────────────────────────────────────────────────────┘

EXPANDIDO (clicou):
┌─────────────────────────────────────────────────────┐
│ ▾ Faturamento por Marketplace    R$ 87.200          │
│   ██████████████████████████░░░░░░░░░░░░░░░░░░░░░░  │
│                                                     │
│ 🟡 ML      ████████████████████████████  R$ 45.200  │
│   ML SP    ██████████████████           R$ 28.100   │
│   ML RJ    ████████████                 R$ 17.100   │
│                                                     │
│ 🟠 Shopee  ████████████████             R$ 22.800   │
│   ...                                               │
└─────────────────────────────────────────────────────┘
```

### Arquivo alterado

| Arquivo | Alteração |
|---------|-----------|
| `src/components/mercadolivre/RevenueByMarketplace.tsx` | Adicionar estado `expanded`, barra segmentada resumida, Collapsible para detalhes, alinhar barras à esquerda |

### Detalhes técnicos

- Usar `useState(false)` para controlar expanded/collapsed
- Barra segmentada: um `div` flex com segmentos coloridos proporcionais ao `pct` de cada marketplace, com tooltip ou legenda inline
- Usar `AnimatePresence` + `motion.div` para animar a abertura/fechamento
- Alinhar barras: trocar `min-w-[100px]` dos labels por `w-[100px]` fixo (ou usar CSS grid com colunas fixas) para que todas as barras iniciem na mesma posição horizontal
- Ícone chevron (▸/▾) no header indica estado
- A barra segmentada fica sempre visível (tanto minimizado quanto expandido)

