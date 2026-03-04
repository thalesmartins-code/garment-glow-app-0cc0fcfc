import { mockReceivables, mockPayables, mockAccounts, cashFlowProjection } from "./financial-data";

export type AlertLevel = "critical" | "warning" | "info";
export type AlertCategory = "vencido" | "a_vencer" | "saldo_baixo" | "projecao";

export interface FinanceAlert {
  id: string;
  level: AlertLevel;
  category: AlertCategory;
  title: string;
  description: string;
  amount?: number;
  date?: string;
  read: boolean;
}

export function generateAlerts(): FinanceAlert[] {
  const alerts: FinanceAlert[] = [];
  const today = new Date("2026-02-23");

  // 1. Overdue receivables
  mockReceivables
    .filter((r) => r.status === "vencido")
    .forEach((r) => {
      const daysLate = Math.floor((today.getTime() - new Date(r.dueDate).getTime()) / 86400000);
      alerts.push({
        id: `rec-${r.id}`,
        level: daysLate > 30 ? "critical" : "warning",
        category: "vencido",
        title: `${r.clientName} — Parcela vencida`,
        description: `${r.description} · ${daysLate} dias de atraso`,
        amount: r.amount,
        date: r.dueDate,
        read: false,
      });
    });

  // 2. Overdue payables
  mockPayables
    .filter((p) => p.status === "vencido")
    .forEach((p) => {
      alerts.push({
        id: `pay-${p.id}`,
        level: "critical",
        category: "vencido",
        title: `Conta a pagar vencida — ${p.supplier}`,
        description: p.description,
        amount: p.amount,
        date: p.dueDate,
        read: false,
      });
    });

  // 3. Upcoming due (next 3 days)
  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);

  mockReceivables
    .filter((r) => r.status === "a_vencer" && new Date(r.dueDate) <= threeDays)
    .forEach((r) => {
      alerts.push({
        id: `soon-rec-${r.id}`,
        level: "info",
        category: "a_vencer",
        title: `${r.clientName} — Vencimento próximo`,
        description: `${r.description} vence em ${r.dueDate}`,
        amount: r.amount,
        date: r.dueDate,
        read: false,
      });
    });

  mockPayables
    .filter((p) => p.status === "a_vencer" && new Date(p.dueDate) <= threeDays)
    .forEach((p) => {
      alerts.push({
        id: `soon-pay-${p.id}`,
        level: "info",
        category: "a_vencer",
        title: `Pagar — ${p.supplier}`,
        description: `${p.description} vence em ${p.dueDate}`,
        amount: p.amount,
        date: p.dueDate,
        read: false,
      });
    });

  // 4. Low balance accounts
  mockAccounts
    .filter((a) => a.type === "caixa" && a.balance < 2000)
    .forEach((a) => {
      alerts.push({
        id: `bal-${a.id}`,
        level: "warning",
        category: "saldo_baixo",
        title: `Saldo baixo — ${a.name}`,
        description: `Saldo atual abaixo de R$ 2.000`,
        amount: a.balance,
        read: false,
      });
    });

  // 5. Cash flow projection risk
  const minProjection = Math.min(...cashFlowProjection.map((c) => c.saldo));
  if (minProjection < 55000) {
    alerts.push({
      id: "proj-risk",
      level: "warning",
      category: "projecao",
      title: "Projeção de caixa — Atenção",
      description: `Saldo projetado pode cair para ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minProjection)} nos próximos 30 dias`,
      amount: minProjection,
      read: false,
    });
  }

  // Sort: critical first, then warning, then info
  const order: Record<AlertLevel, number> = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.level] - order[b.level]);
}
