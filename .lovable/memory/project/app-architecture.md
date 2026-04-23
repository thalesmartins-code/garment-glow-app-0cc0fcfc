---
name: app-architecture
description: App é 100% Mercado Livre — sem prefixo /api. Rotas planas (/, /estoque, /anuncios, /tv, /perfil, etc.).
type: feature
---
O aplicativo opera exclusivamente com Mercado Livre via API. Todas as rotas são planas, sem prefixo `/api`: a rota raiz `/` é a página de Vendas, `/perfil` é o perfil do usuário, `/tv` é o Modo TV, e os módulos seguem o padrão `/estoque`, `/anuncios`, `/pedidos`, `/publicidade`, `/financeiro`, `/reputacao`, `/devolucoes`, `/perguntas`, `/metas`, `/precos-custos`, `/sellers`, `/integracoes`, `/organizacao`, `/monitoramento`. Não há mais ambiente "Marketplaces via Planilha" (/sheets) nem hub seletor. URLs antigas com `/api/*` foram removidas sem redirect — bookmarks antigos vão para 404. A Redirect URI do Mercado Livre permanece `https://analytics.alcavie.com/integracoes`. Transições entre páginas usam framer-motion.
