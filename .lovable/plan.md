

# Nova matriz de permissões por role

## Regras solicitadas

- **Owner**: acesso total (única role com acesso a Organização, Sellers, Integrações e Monitoramento, conforme pedido).
- **Admin**: acesso total a operação + acesso à página de Organização (gerenciar membros e convites). Sem Sellers, Integrações ou Monitoramento.
- **Member**: foco em operação diária — vê e edita dados de catálogo, vendas, pedidos, financeiro, devoluções, perguntas e metas. Sem áreas administrativas (Org/Sellers/Integrações/Monitoramento).
- **Viewer**: somente leitura de dashboards e relatórios. Não acessa Pedidos, Perguntas, Devoluções, Metas, Preços/Custos (áreas que envolvem ação operacional ou estratégia sensível).

## Matriz proposta

```text
Rota                    Owner  Admin  Member  Viewer   Observação
/api                      ✓      ✓      ✓       ✓     Hub de vendas
/api/estoque              ✓      ✓      ✓       ✓     Catálogo (leitura)
/api/anuncios             ✓      ✓      ✓       ✓     Anúncios/ranking
/api/publicidade          ✓      ✓      ✓       ✓     ADS leitura
/api/reputacao            ✓      ✓      ✓       ✓     Reputação leitura
/api/financeiro           ✓      ✓      ✓       ✓     Financeiro leitura
/api/vendas-hora          ✓      ✓      ✓       ✓     Análise por hora
/api/relatorios           ✓      ✓      ✓       ✓     Relatórios
/api/pedidos              ✓      ✓      ✓       ✗     Operacional
/api/perguntas            ✓      ✓      ✓       ✗     Atendimento
/api/devolucoes           ✓      ✓      ✓       ✗     Pós-venda
/api/metas                ✓      ✓      ✓       ✗     Definição de metas
/api/precos-custos        ✓      ✓      ✓       ✗     Estratégia de preço
/api/perfil               ✓      ✓      ✓       ✓     Perfil pessoal
/api/organizacao          ✓      ✓      ✗       ✗     Membros/convites
/api/sellers              ✓      ✗      ✗       ✗     Apenas Owner
/api/integracoes          ✓      ✗      ✗       ✗     Apenas Owner
/api/monitoramento        ✓      ✗      ✗       ✗     Apenas Owner
```

## Mudanças técnicas

**Arquivo**: `src/config/roleAccess.ts`

- Substituir os grupos por:
  - `ALL` = todos os 4 roles (dashboards visíveis a todos).
  - `OPERATIONAL` = `owner | admin | member` (operação que viewer não acessa: pedidos, perguntas, devoluções, metas, preços-custos).
  - `ORG_ADMIN` = `owner | admin` (apenas `/api/organizacao`).
  - `OWNER_ONLY` = `owner` (Sellers, Integrações, Monitoramento).
- Reatribuir cada rota da matriz acima.

**Sidebar/EnvironmentSidebar**: já consomem `canAccess`, então o menu lateral oculta automaticamente os itens que o role não pode ver — sem mudanças adicionais no Sidebar.

**Sem mudanças** em RLS, edge functions, contextos ou outras telas. Só a tabela de permissões de rota muda; o restante já depende dela.

## Considerações

- **Admin sem Sellers/Integrações**: significa que Admins gerenciam pessoas (membros/convites) mas não conectam contas Mercado Livre nem cadastram novos sellers — isso fica concentrado no Owner. Confirme se é a intenção; se quiser Admin também nessas áreas, troque `OWNER_ONLY` por `ORG_ADMIN` em `/api/sellers` e `/api/integracoes`.
- **Viewer puramente leitura**: bloqueado em pedidos/perguntas/devoluções para evitar que ele tome ações operacionais por engano. Caso prefira que veja (sem editar), podemos adicionar essas rotas ao grupo `ALL` — mas as próprias páginas precisariam respeitar role para esconder botões de ação (não está no escopo agora).

