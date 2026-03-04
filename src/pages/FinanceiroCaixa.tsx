import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Wallet, CreditCard } from "lucide-react";
import {
  mockAccounts,
  mockTransactions,
  mockConciliation,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
} from "@/lib/financial-data";

const iconMap: Record<string, typeof Wallet> = {
  caixa: Wallet,
  banco: Landmark,
  adquirente: CreditCard,
};

export default function FinanceiroCaixa() {
  const totalSaldo = mockAccounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div>
      <PageHeader title="Caixa e Bancos" subtitle="Controle de tesouraria e conciliação" />
      <div className="p-8 space-y-8">
        {/* Account cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-rose text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-80">Saldo Consolidado</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalSaldo)}</p>
            </CardContent>
          </Card>
          {mockAccounts.map((acc) => {
            const Icon = iconMap[acc.type] || Wallet;
            return (
              <Card key={acc.id} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{acc.name}</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(acc.balance)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="extrato-geral">
          <TabsList>
            <TabsTrigger value="extrato-geral">Extrato Geral</TabsTrigger>
            <TabsTrigger value="por-conta">Por Conta</TabsTrigger>
            <TabsTrigger value="conciliacao">Conciliação</TabsTrigger>
          </TabsList>

          <TabsContent value="extrato-geral">
            <Card className="border-0 shadow-md mt-4">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Forma Pgto</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{t.date}</TableCell>
                        <TableCell className="text-sm font-medium">{t.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.category}</TableCell>
                        <TableCell className="text-sm">{t.paymentMethod}</TableCell>
                        <TableCell className={`text-sm font-semibold text-right ${t.type === "receita" ? "text-emerald-600" : "text-red-600"}`}>
                          {t.type === "receita" ? "+" : "-"}{formatCurrency(t.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(t.status)}`}>
                            {getStatusLabel(t.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="por-conta">
            <Card className="border-0 shadow-md mt-4">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">Selecione uma conta acima para ver seu extrato individual. (Funcionalidade em desenvolvimento)</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAccounts.map((acc) => (
                      <TableRow key={acc.id}>
                        <TableCell className="font-medium text-sm">{acc.name}</TableCell>
                        <TableCell className="text-sm capitalize">{acc.type}</TableCell>
                        <TableCell className="text-sm font-semibold text-right">{formatCurrency(acc.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conciliacao">
            <Card className="border-0 shadow-md mt-4">
              <CardHeader>
                <CardTitle className="text-base">Conciliação de Cartões</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Sistema</TableHead>
                      <TableHead className="text-right">Adquirente</TableHead>
                      <TableHead className="text-right">Diferença</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockConciliation.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{c.date}</TableCell>
                        <TableCell className="text-sm">{c.description}</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrency(c.systemAmount)}</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrency(c.acquirerAmount)}</TableCell>
                        <TableCell className={`text-sm font-semibold text-right ${c.difference < 0 ? "text-red-600" : c.difference > 0 ? "text-emerald-600" : ""}`}>
                          {formatCurrency(c.difference)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(c.status)}`}>
                            {getStatusLabel(c.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
