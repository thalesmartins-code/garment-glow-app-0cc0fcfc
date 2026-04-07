import {
  Target,
  ArrowLeft,
  ClipboardList,
  Layers,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  PackageX,
  Plug,
  Receipt,
  Settings2,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  EnvironmentSidebar, type SidebarNavSection } from "./EnvironmentSidebar";

const apiSections: SidebarNavSection[] = [
  {
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/api",
        noSelfLink: true,
        children: [
          { icon: TrendingUp,  label: "Vendas",   path: "/api"            },
          { icon: ShoppingBag, label: "Anúncios", path: "/api/produtos"   },
          { icon: Receipt,     label: "Margem",   path: "/api/financeiro" },
        ],
      },
      {
        icon: Layers,
        label: "Operações",
        path: "/api/estoque",
        noSelfLink: true,
        children: [
          { icon: Megaphone,     label: "Ads",     path: "/api/anuncios" },
          { icon: Package,       label: "Estoque", path: "/api/estoque"  },
          { icon: ClipboardList, label: "Pedidos", path: "/api/pedidos"  },
        ],
      },
    ],
  },
  {
    label: "Pós-venda",
    items: [
      { icon: Star,         label: "Reputação",  path: "/api/reputacao"  },
      { icon: PackageX,     label: "Devoluções", path: "/api/devolucoes" },
      { icon: MessageCircle, label: "Mensagens",  path: "/api/perguntas"  },
    ],
  },
  {
    label: "Configurações",
    items: [
      { icon: Target,   label: "Metas",       path: "/api/metas"       },
      { icon: Users,    label: "Sellers",     path: "/api/sellers"     },
      { icon: Plug,     label: "Integrações", path: "/api/integracoes" },
    ],
  },
];

const backToMainItem = {
  icon: ArrowLeft,
  label: "Voltar ao painel",
  path: "/",
};

export function ApiSidebar() {
  return (
    <EnvironmentSidebar
      sections={apiSections}
      footerItem={backToMainItem}
    />
  );
}
