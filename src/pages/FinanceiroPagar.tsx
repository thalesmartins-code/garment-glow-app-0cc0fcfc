import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileBox } from "lucide-react";
import { mockPayables, formatCurrency, getStatusColor, getStatusLabel } from "@/lib/financial-data";

export default function FinanceiroPagar() {
  const [statusFilter, setStatusFilter] = useState("todos");

  const filtered = statusFilter === "todos"
    ? mockPayables
    : mockPayables.filter((p) => p.status === statusFilter);

  const totalPagar = mockPayables.filter((p) => p.status !== "pago").reduce((s, p) => s + p.amount - p.paidAmount, 0);
  const totalVencido = mockPayables.filter((p) => p.status === "vencido").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader title="Contas a Pagar" subtitle="Gestão de fornecedores e despesas" />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total a Pagar</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalPagar)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Vencidos</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(totalVencido)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Vencendo Hoje</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">0</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Contas</CardTitle>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="a_vencer">A Vencer</TabsTrigger>
                <TabsTrigger value="vencido">Vencidos</TabsTrigger>
                <TabsTrigger value="pago">Pagos</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>NF</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">{p.supplier}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.description}</TableCell>
                    <TableCell className="text-sm">{p.category}</TableCell>
                    <TableCell className="text-sm">{p.dueDate}</TableCell>
                    <TableCell className="text-sm font-medium">{formatCurrency(p.amount)}</TableCell>
                    <TableCell className="text-sm">
                      {p.nfNumber ? (
                        <div className="flex items-center gap-1 text-accent">
                          <FileBox className="w-3 h-3" />
                          {p.nfNumber}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
