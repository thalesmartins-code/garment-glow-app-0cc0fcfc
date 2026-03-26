import { ArrowLeft, BarChart3, FileUp, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { EnvironmentSidebar } from "./EnvironmentSidebar";

const mainItems = [
  { icon: BarChart3, label: "Dashboard", path: "/sheets" },
  { icon: TrendingUp, label: "Vendas", path: "/sheets/vendas-diarias" },
  { icon: FileUp, label: "Importação", path: "/sheets/importacao" },
  { icon: Users, label: "Sellers", path: "/sheets/sellers" },
  { icon: ShieldCheck, label: "Usuários", path: "/sheets/usuarios" },
];

const backToHub = {
  icon: ArrowLeft,
  label: "Voltar ao painel",
  path: "/",
};

export function MainSidebar() {
  return <EnvironmentSidebar items={mainItems} footerItem={backToHub} />;
}
