

## Plano: Lojas lado a lado no header de Vendas

### Comportamento desejado

- As lojas do seller aparecem como **tabs/chips horizontais** lado a lado no header (ao invés de um dropdown).
- Quando um marketplace tem **apenas 1 loja**, ela aparece diretamente como um chip clicável.
- Quando um marketplace tem **mais de 1 loja**, aparece um chip com dropdown para selecionar entre as lojas daquele marketplace.
- Manter a opção "Todas" como primeiro item.

### Arquivo alterado

**`src/components/layout/StoreGroupSelector.tsx`** — reescrever o componente:

1. **Layout horizontal**: trocar o Popover com lista vertical por uma `div flex` com chips lado a lado.
2. **Chip "Todas"**: primeiro item, destacado quando `selectedStoreIds` está vazio.
3. **Marketplaces com 1 loja**: renderizar diretamente um chip com o nome da loja + emoji do marketplace. Clique seleciona/deseleciona.
4. **Marketplaces com 2+ lojas**: renderizar um `DropdownMenu` cujo trigger é um chip com o nome do marketplace + chevron. O dropdown lista as lojas individuais com checkboxes para multi-seleção.
5. Manter a mesma lógica de seleção existente (`selectedStoreIds`, `toggleStoreId`, `setSelectedStoreIds`).

### Detalhes visuais

- Chips com estilo similar ao restante do header: `h-7 px-2.5 text-xs rounded-lg border border-border/50`.
- Chip ativo: `bg-primary/10 text-primary border-primary/30`.
- Separador vertical (`w-px h-5 bg-border`) entre o seller e os chips de lojas (já existente).

