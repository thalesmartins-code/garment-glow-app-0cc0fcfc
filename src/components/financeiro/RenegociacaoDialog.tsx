import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receivable, formatCurrency } from "@/lib/financial-data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: Receivable;
}

export function RenegociacaoDialog({ open, onOpenChange, receivable }: Props) {
  const saldoDevedor = receivable.amount - receivable.paidAmount;
  const [parcelas, setParcelas] = useState(3);
  const [juros, setJuros] = useState(2);

  const totalComJuros = saldoDevedor * (1 + (juros / 100) * parcelas);
  const valorParcela = totalComJuros / parcelas;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renegociar Dívida</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="font-medium">{receivable.clientName}</p>
            <p className="text-sm text-muted-foreground mt-2">Saldo Devedor</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(saldoDevedor)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nº de Parcelas</Label>
              <Input type="number" min={1} max={24} value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} />
            </div>
            <div>
              <Label>Juros (% a.m.)</Label>
              <Input type="number" min={0} max={10} step={0.5} value={juros} onChange={(e) => setJuros(Number(e.target.value))} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/10 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Total com juros:</span>
              <span className="font-semibold">{formatCurrency(totalComJuros)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Valor por parcela:</span>
              <span className="font-semibold">{formatCurrency(valorParcela)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onOpenChange(false)}>Confirmar Renegociação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
