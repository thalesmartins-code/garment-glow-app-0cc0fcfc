---
name: Super Admin Portal
description: Painel /admin separado para super admin global (app_role=admin), com dashboard, CRUD de organizações e listagem cross-org de usuários
type: feature
---
O painel Super Admin (`/admin`) é uma área isolada do sistema acessível apenas a usuários com `app_role = 'admin'` (role global no `user_roles`, não org_role). Possui layout próprio (`AdminLayout`) com sidebar dedicada, sem `SellerMarketplaceBar`, e é protegido pelo `SuperAdminRoute`.

Sub-rotas:
- `/admin` → Visão geral (KPIs cross-org: orgs, usuários, memberships, sellers, conexões ML)
- `/admin/organizacoes` → CRUD de organizações (criar, editar nome, excluir; cria owner+membership atômico)
- `/admin/usuarios` → Listagem global de todos os usuários do sistema com suas organizações

Backend: edge functions `super-admin-orgs` (actions: list, create, update, delete, stats) e `super-admin-users`. Ambas validam `app_role = 'admin'` via service role e registram ações em `audit_log` com prefixo `super_admin.*`.

Diferenças importantes:
- `/api/usuarios` (RoleRoute) → admin DA organização atual
- `/admin` (SuperAdminRoute) → super admin do SISTEMA inteiro
- `/organizacao` → settings da org atual (mantém)

Acesso pelo menu "Minha Conta" no header (item "Painel super admin" só aparece para `app_role=admin`).