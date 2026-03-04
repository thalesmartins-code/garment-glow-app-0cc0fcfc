import { useState, useMemo } from "react";
import { Bell, AlertTriangle, AlertCircle, Info, Check, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAlerts, FinanceAlert, AlertLevel } from "@/lib/notifications-data";
import { formatCurrency } from "@/lib/financial-data";
import { cn } from "@/lib/utils";

const levelConfig: Record<AlertLevel, { icon: typeof AlertTriangle; color: string; bg: string; label: string }> = {
  critical: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Crítico" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", label: "Atenção" },
  info: { icon: Info, color: "text-accent", bg: "bg-accent/10", label: "Info" },
};

export function NotificationCenter() {
  const [alerts, setAlerts] = useState<FinanceAlert[]>(() => generateAlerts());
  const [filter, setFilter] = useState("todos");

  const unreadCount = alerts.filter((a) => !a.read).length;

  const filtered = useMemo(() => {
    if (filter === "todos") return alerts;
    return alerts.filter((a) => a.category === filter);
  }, [alerts, filter]);

  const markAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Notificações</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={markAllRead}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
          <Tabs value={filter} onValueChange={setFilter} className="mt-2">
            <TabsList className="w-full h-8">
              <TabsTrigger value="todos" className="text-xs flex-1">Todos</TabsTrigger>
              <TabsTrigger value="vencido" className="text-xs flex-1">Vencidos</TabsTrigger>
              <TabsTrigger value="a_vencer" className="text-xs flex-1">Próximos</TabsTrigger>
              <TabsTrigger value="saldo_baixo" className="text-xs flex-1">Saldo</TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              filtered.map((alert) => {
                const config = levelConfig[alert.level];
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "group relative flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      alert.read
                        ? "bg-card border-border/50 opacity-60"
                        : `${config.bg} border-border`
                    )}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-tight", !alert.read && "text-foreground")}>
                          {alert.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {alert.amount !== undefined && (
                          <span className="text-xs font-semibold">{formatCurrency(alert.amount)}</span>
                        )}
                        <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5", config.color)}>
                          {config.label}
                        </Badge>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-accent ml-auto flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Summary footer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{alerts.filter((a) => a.level === "critical").length} críticos · {alerts.filter((a) => a.level === "warning").length} alertas</span>
            <span>{unreadCount} não lidas</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
