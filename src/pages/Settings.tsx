import { Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-accent-foreground">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground text-sm">Gerencie metas, marketplaces e preferências</p>
        </div>
      </div>

      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-xl font-semibold mb-2">Configurações</h3>
        <p className="text-muted-foreground">
          Configure metas de vendas, marketplaces ativos e preferências do sistema.
        </p>
      </Card>
    </div>
  );
};

export default Settings;
