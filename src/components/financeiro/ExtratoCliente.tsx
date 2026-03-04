import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receivable, mockReceivables, formatCurrency, getStatusColor, getStatusLabel } from "@/lib/financial-data";
import { exportExtrato } from "@/lib/export-utils";
import { Send, Download } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: Receivable;
}

export function ExtratoCliente({ open, onOpenChange, receivable }: Props) {
  const clientReceivables = mockReceivables.filter((r) => r.clientId === receivable.clientId);
  const totalCompras = clientReceivables.reduce((s, r) => s + r.amount, 0);
  const totalPago = clientReceivables.reduce((s, r) => s + r.paidAmount, 0);
  const saldo = totalCompras - totalPago;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Extrato do Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="font-semibold text-lg">{receivable.clientName}</p>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Compras</p>
                <p className="font-semibold text-sm">{formatCurrency(totalCompras)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pago</p>
                <p className="font-semibold text-sm text-emerald-600">{formatCurrency(totalPago)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo Devedor</p>
                <p className="font-semibold text-sm text-red-600">{formatCurrency(saldo)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {clientReceivables.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.description}</p>
                  <p className="text-xs text-muted-foreground">Parcela {r.installmentNumber}/{r.totalInstallments} · Venc: {r.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(r.amount)}</p>
                  <Badge variant="secondary" className={`text-[10px] ${getStatusColor(r.status)}`}>
                    {getStatusLabel(r.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => exportExtrato(receivable.clientName, clientReceivables)}>
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Send className="w-4 h-4 mr-2" /> Enviar via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
