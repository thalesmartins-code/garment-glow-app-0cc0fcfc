

## Incrementar Login com Cards Flutuantes de Funcionalidades

### O que muda

Adicionar cards flutuantes animados no painel esquerdo da tela de login, posicionados de forma absoluta ao redor do conteudo principal. Cada card representa uma funcionalidade do sistema (estoque, ranking de marcas, ranking de produtos, reputacao, metas) com mini visualizacoes e animacao de flutuacao continua (float up/down).

### Cards flutuantes planejados

1. **Analise de Estoque** - Mini lista com barras de progresso coloridas (3 categorias)
2. **Ranking de Marcas** - Top 3 marcas com medalhas (ouro, prata, bronze)
3. **Ranking de Produtos** - Top 3 produtos com valores de venda
4. **Reputacao** - Indicador circular com nota e cor verde
5. **Metas** - Barra de progresso com percentual atingido

### Animacao

Cada card tera:
- Entrada com `fadeScale` staggered
- Animacao infinita de flutuacao (`y: [0, -8, 0]`) com duracao e delay diferentes por card para efeito organico
- Glassmorphism (bg-white/[0.07], backdrop-blur, border-white/10)
- Posicionamento absoluto em diferentes cantos do painel, sem sobrepor o conteudo central

### Mudancas tecnicas

| Arquivo | Alteracao |
|---|---|
| `src/pages/Login.tsx` | Adicionar 5 componentes `FloatingCard` com posicionamento absoluto, animacao de float infinita, e mini visualizacoes de cada funcionalidade. Importar icones adicionais (Package, Award, Trophy, Star, Target). Reorganizar z-index para cards ficarem atras do conteudo principal. |

### Layout dos cards flutuantes

```text
  [Reputacao]                    [Metas]
       ╲                          ╱
        ╲    ┌──────────────┐    ╱
         ╲   │  Conteudo    │   ╱
              │  Principal   │
  [Estoque]  │  (KPIs etc)  │  [Ranking Marcas]
              └──────────────┘
                     │
              [Ranking Produtos]
```

Os cards serao menores que os KPIs existentes, com opacidade reduzida para nao competir visualmente, e aparecerao apenas em telas `xl:` para evitar sobreposicao.

