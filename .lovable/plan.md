

## Plano: Preencher espaço do card de Publicidade

O card de Publicidade tem menos conteúdo que os cards de Reputação e Funil, deixando espaço em branco. A solução é adicionar mais informações úteis para preencher o card.

### Alterações em `src/pages/MercadoLivre.tsx`

1. **Adicionar métricas extras após o grid atual:**
   - **Conversão ADS** (Cliques → Pedidos): percentual calculado como `(pedidos / cliques) * 100`
   - **Custo por Pedido**: calculado como `gasto / pedidos`

2. **Adicionar mini ranking dos top 3 campanhas** (do array `campaigns` retornado pelo hook `useMLAds`):
   - Listar nome da campanha, status (badge colorido), e ROAS
   - Separar visualmente com `border-t`

3. **Ajustar hook**: Destructurar `campaigns` (renomeado `adsCampaigns`) do `useMLAds` que já retorna esse dado.

### Resultado visual

```text
┌─ Publicidade ──────────────────┐
│  Gasto          ROAS           │
│  R$ 5.200      3.42x          │
│  ─── sparkline ROAS ────────  │
│  Receita    R$17.8k │ Impr 45k│
│  Cliques     1.2k   │ Ped  89 │
│  CTR        2.67%   │ CPC R$4 │
│  Conv. ADS  7.4%  │ CPP R$58 │
│  ── Top Campanhas ──────────  │
│  1. Campanha X    ● 4.2x      │
│  2. Campanha Y    ● 2.8x      │
│  3. Campanha Z    ● 1.9x      │
└────────────────────────────────┘
```

### Arquivos editados
- `src/pages/MercadoLivre.tsx`

