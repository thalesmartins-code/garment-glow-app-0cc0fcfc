import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { Layers, Database } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface SyncLogEntry {
  date_from: string;
  date_to: string;
  source: string;
  synced_at: string;
  days_synced: number;
  orders_fetched: number;
}

interface Props {
  title: string;
  children?: React.ReactNode;
  lastUpdated?: Date | null;
}

function formatSyncRange(entry: SyncLogEntry) {
  const from = new Date(entry.date_from + "T12:00:00");
  const to = new Date(entry.date_to + "T12:00:00");
  const fromStr = format(from, "dd/MM");
  const toStr = format(to, "dd/MM");
  return fromStr === toStr ? fromStr : `${fromStr}–${toStr}`;
}

function formatSyncSummary(logs: SyncLogEntry[]): string {
  if (logs.length === 0) return "Nenhum período sincronizado";

  const auto = logs.filter(l => l.source === "auto");
  const historical = logs.filter(l => l.source === "historical");

  const parts: string[] = [];

  if (auto.length > 0) {
    const dates = auto.map(l => l.date_from).concat(auto.map(l => l.date_to)).sort();
    const minDate = new Date(dates[0] + "T12:00:00");
    const maxDate = new Date(dates[dates.length - 1] + "T12:00:00");
    parts.push(`${format(minDate, "dd/MM")} a ${format(maxDate, "dd/MM")} (auto)`);
  }

  if (historical.length > 0) {
    const dates = historical.map(l => l.date_from).concat(historical.map(l => l.date_to)).sort();
    const minDate = new Date(dates[0] + "T12:00:00");
    const maxDate = new Date(dates[dates.length - 1] + "T12:00:00");
    parts.push(`${format(minDate, "dd/MM")} a ${format(maxDate, "dd/MM")} (histórico)`);
  }

  return parts.join(" · ");
}

export function MLPageHeader({ title, children, lastUpdated }: Props) {
  const { user } = useAuth();
  const { selectedMarketplace, activeMarketplace } = useMarketplace();
  const [nickname, setNickname] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("ml_user_cache")
      .select("nickname")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setNickname(data.nickname);
      });

    // Load sync logs
    (supabase as any)
      .from("ml_sync_log")
      .select("date_from, date_to, source, synced_at, days_synced, orders_fetched")
      .eq("user_id", user.id)
      .order("synced_at", { ascending: false })
      .limit(50)
      .then(({ data }: any) => {
        if (data) setSyncLogs(data);
      });
  }, [user]);

  const formattedDate = lastUpdated
    ? lastUpdated.toLocaleString("pt-BR")
    : null;

  const isAll = selectedMarketplace === "all";
  const mp = activeMarketplace;
  const syncSummary = formatSyncSummary(syncLogs);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isAll ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Layers className="h-5 w-5" />
          </div>
        ) : mp ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mp.color} text-white`}
          >
            <mp.icon className="h-5 w-5" />
          </div>
        ) : null}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isAll ? "Todos os marketplaces" : mp?.name ?? "Marketplace"}
          </p>
          {nickname && (
            <p className="text-xs text-muted-foreground">Vendedor: {nickname}</p>
          )}
          <p className="text-xs text-muted-foreground/70">
            {formattedDate ? `Última sinc: ${formattedDate}` : "Nunca sincronizado"}
          </p>
          {syncLogs.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground/60 flex items-center gap-1 cursor-help">
                  <Database className="h-3 w-3" />
                  {syncSummary}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">Períodos sincronizados:</p>
                  {syncLogs.slice(0, 10).map((log, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span>{formatSyncRange(log)} ({log.source})</span>
                      <span className="text-muted-foreground">
                        {log.orders_fetched} ped · {new Date(log.synced_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
