

## Plano: Otimizar seletor de lojas para marketplaces com loja única

### Problema atual

Quando um marketplace tem apenas 1 loja, o dropdown mostra um **header do marketplace** (ícone + nome) e logo abaixo a **loja indentada** — redundante, pois não há escolha dentro daquele grupo.

### Solução

No `MarketplaceSwitcher.tsx`, alterar a renderização dos `storeGroups`:

1. **Marketplace com 1 loja**: renderizar como item direto (sem header de grupo, sem indentação). Mostrar o ícone do marketplace + nome da loja como um `DropdownMenuItem` simples, no mesmo nível do "Todas as lojas".

2. **Marketplace com 2+ lojas**: manter o comportamento atual — header do marketplace como label + lojas indentadas abaixo com checkboxes.

### Arquivo alterado

**`src/components/layout/MarketplaceSwitcher.tsx`** — linhas 195-236:

- Dentro do `.map` de `storeGroups`, verificar `stores.length === 1`:
  - **Se 1**: renderizar um `DropdownMenuItem` com o ícone do marketplace (h-7 w-7 com gradient) + nome da loja + checkbox. Sem header de grupo, sem indentação (`pl-2` ao invés de `pl-9`).
  - **Se > 1**: manter o layout atual com header do marketplace e lojas indentadas.

### Detalhes técnicos

```text
stores.length === 1:
  [🟡 icon] Loja ML São Paulo     [✓]

stores.length > 1:
  [🟡] MERCADO LIVRE
       Loja ML São Paulo          [✓]
       Loja ML Rio de Janeiro     [ ]
```

