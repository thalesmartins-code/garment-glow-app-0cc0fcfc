import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, FileText, RefreshCcw, Receipt, ShieldAlert } from "lucide-react";
import { mockReceivables, formatCurrency, getStatusColor, getStatusLabel } from "@/lib/financial-data";
import { RenegociacaoDialog } from "@/components/financeiro/RenegociacaoDialog";
import { ReciboPreview } from "@/components/financeiro/ReciboPreview";
import { ExtratoCliente } from "@/components/financeiro/ExtratoCliente";

export default function FinanceiroReceber() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [renegDialogOpen, setRenegDialogOpen] = useState(false);
  const [reciboOpen, setReciboOpen] = useState(false);
  const [extratoOpen, setExtratoOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<typeof mockReceivables[0] | null>(null);

  const filtered = statusFilter === "todos"
    ? mockReceivables
    : mockReceivables.filter((r) => r.status === statusFilter);

  const totalReceber = mockReceivables.filter((r) => r.status !== "pago").reduce((s, r) => s + r.amount - r.paidAmount, 0);
  const totalVencido = mockReceivables.filter((r) => r.status === "vencido").reduce((s, r) => s + r.amount, 0);
  const inadimplencia = totalReceber > 0 ? ((totalVencido / (totalReceber + mockReceivables.filter(r => r.status === "pago").reduce((s, r) => s + r.amount, 0))) * 100) : 0;

  return (
    <div>
      <PageHeader title="Contas a Receber" subtitle="Gestão de crediário e cobrança" />
      <div className="p-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total a Receber</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalReceber)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Inadimplência</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{inadimplencia.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Vencidos Hoje</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{mockReceivables.filter((r) => r.status === "vencido").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters + Table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Parcelas</CardTitle>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="a_vencer">A Vencer</TabsTrigger>
                <TabsTrigger value="vencido">Vencidos</TabsTrigger>
                <TabsTrigger value="pago">Pagos</TabsTrigger>
                <TabsTrigger value="renegociado">Renegociados</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{r.clientName}</span>
                        {r.protestStatus === "protestado" && (
                          <span title="Protestado"><ShieldAlert className="w-4 h-4 text-red-500" /></span>
                        )}
                        {r.protestStatus === "negativado" && (
                          <span title="Negativado SPC/Serasa"><AlertTriangle className="w-4 h-4 text-red-600" /></span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.description}</TableCell>
                    <TableCell className="text-sm">{r.installmentNumber}/{r.totalInstallments}</TableCell>
                    <TableCell className="text-sm">{r.dueDate}</TableCell>
                    <TableCell className="text-sm font-medium">{formatCurrency(r.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(r.status === "vencido" || r.status === "renegociado") && (
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedReceivable(r); setRenegDialogOpen(true); }} title="Renegociar">
                            <RefreshCcw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedReceivable(r); setExtratoOpen(true); }} title="Extrato">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedReceivable(r); setReciboOpen(true); }} title="Recibo">
                          <Receipt className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedReceivable && (
        <>
          <RenegociacaoDialog open={renegDialogOpen} onOpenChange={setRenegDialogOpen} receivable={selectedReceivable} />
          <ReciboPreview open={reciboOpen} onOpenChange={setReciboOpen} receivable={selectedReceivable} />
          <ExtratoCliente open={extratoOpen} onOpenChange={setExtratoOpen} receivable={selectedReceivable} />
        </>
      )}
    </div>
  );
}
