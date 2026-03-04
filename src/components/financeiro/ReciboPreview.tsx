import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receivable, formatCurrency } from "@/lib/financial-data";
import { Printer } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: Receivable;
}

export function ReciboPreview({ open, onOpenChange, receivable }: Props) {
  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recibo de Pagamento</DialogTitle>
        </DialogHeader>
        <div className="border rounded-lg p-6 space-y-4 bg-card">
          <div className="text-center border-b pb-4">
            <h3 className="text-lg font-bold">ModaStore</h3>
            <p className="text-xs text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
            <p className="text-xs text-muted-foreground">Rua da Moda, 123 - Centro</p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-center">RECIBO Nº {receivable.id.replace("rec", "").padStart(6, "0")}</h4>
            <p>Recebi de <strong>{receivable.clientName}</strong> a quantia de <strong>{formatCurrency(receivable.amount)}</strong> referente a:</p>
            <p className="text-muted-foreground">{receivable.description} — Parcela {receivable.installmentNumber}/{receivable.totalInstallments}</p>
          </div>

          <div className="border-t pt-4 text-sm space-y-1">
            <div className="flex justify-between"><span>Valor:</span><span className="font-semibold">{formatCurrency(receivable.amount)}</span></div>
            <div className="flex justify-between"><span>Data:</span><span>{today}</span></div>
            <div className="flex justify-between"><span>Forma de Pagamento:</span><span>{receivable.paymentMethod}</span></div>
          </div>

          <div className="border-t pt-4 mt-4 text-center">
            <div className="w-48 mx-auto border-t border-foreground mt-12 pt-2">
              <p className="text-xs text-muted-foreground">Assinatura do Recebedor</p>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground italic mt-4">
            Obrigado por vestir a ModaStore! ✨
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
