import { useState } from "react";
import {
  Search,
  Plus,
  Calendar,
  MoreHorizontal,
  Eye,
  Printer,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const salesData = [
  {
    id: "VND-001",
    date: "02/02/2026",
    time: "14:32",
    customer: "Ana Oliveira",
    items: 3,
    total: 489.7,
    payment: "Cartão Crédito",
    status: "completed",
  },
  {
    id: "VND-002",
    date: "02/02/2026",
    time: "13:15",
    customer: "Carlos Silva",
    items: 1,
    total: 159.9,
    payment: "PIX",
    status: "completed",
  },
  {
    id: "VND-003",
    date: "02/02/2026",
    time: "11:48",
    customer: "Maria Santos",
    items: 2,
    total: 379.8,
    payment: "Cartão Débito",
    status: "pending",
  },
  {
    id: "VND-004",
    date: "01/02/2026",
    time: "17:22",
    customer: "Pedro Costa",
    items: 4,
    total: 899.6,
    payment: "Cartão Crédito",
    status: "completed",
  },
  {
    id: "VND-005",
    date: "01/02/2026",
    time: "15:05",
    customer: "Lucia Ferreira",
    items: 1,
    total: 179.9,
    payment: "Dinheiro",
    status: "completed",
  },
  {
    id: "VND-006",
    date: "01/02/2026",
    time: "10:30",
    customer: "Roberto Alves",
    items: 2,
    total: 339.8,
    payment: "PIX",
    status: "refunded",
  },
  {
    id: "VND-007",
    date: "31/01/2026",
    time: "16:45",
    customer: "Fernanda Lima",
    items: 5,
    total: 1249.5,
    payment: "Cartão Crédito",
    status: "completed",
  },
  {
    id: "VND-008",
    date: "31/01/2026",
    time: "14:20",
    customer: "João Mendes",
    items: 1,
    total: 459.9,
    payment: "Cartão Crédito",
    status: "completed",
  },
];

const statusConfig = {
  completed: { label: "Concluída", className: "bg-success/10 text-success border-0" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning border-0" },
  refunded: { label: "Reembolsada", className: "bg-destructive/10 text-destructive border-0" },
};

const metrics = [
  {
    title: "Vendas Hoje",
    value: "R$ 1.029,40",
    icon: DollarSign,
    change: "+12%",
  },
  {
    title: "Pedidos Hoje",
    value: "8",
    icon: ShoppingCart,
    change: "+3",
  },
  {
    title: "Ticket Médio",
    value: "R$ 128,67",
    icon: TrendingUp,
    change: "+5%",
  },
  {
    title: "Última Venda",
    value: "14:32",
    icon: Clock,
    change: "há 28 min",
  },
];

const Vendas = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFiltered = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <>
      <PageHeader title="Vendas" subtitle="Registre e acompanhe todas as transações" />
      <div className="p-8">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <p className="text-xs text-success mt-1">{metric.change}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Bar */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-0"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-secondary/50 border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="refunded">Reembolsadas</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Button variant="outline" className="bg-secondary/50 border-0">
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </Button>

            {/* New Sale Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-rose hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Venda
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Venda</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para registrar uma nova transação.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Cliente</Label>
                    <Input
                      id="customer"
                      placeholder="Nome do cliente"
                      className="bg-secondary/50 border-0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="product">Produto</Label>
                    <Select>
                      <SelectTrigger className="bg-secondary/50 border-0">
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vestido-floral">Vestido Floral Primavera - R$ 289,90</SelectItem>
                        <SelectItem value="camisa-social">Camisa Social Slim - R$ 159,90</SelectItem>
                        <SelectItem value="calca-jeans">Calça Jeans Skinny - R$ 199,90</SelectItem>
                        <SelectItem value="blazer">Blazer Executivo - R$ 459,90</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        defaultValue="1"
                        min="1"
                        className="bg-secondary/50 border-0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment">Pagamento</Label>
                      <Select>
                        <SelectTrigger className="bg-secondary/50 border-0">
                          <SelectValue placeholder="Forma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Cartão Crédito</SelectItem>
                          <SelectItem value="debit">Cartão Débito</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-gradient-rose hover:opacity-90"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Registrar Venda
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Data/Hora</TableHead>
              <TableHead className="font-semibold">Cliente</TableHead>
              <TableHead className="font-semibold">Itens</TableHead>
              <TableHead className="font-semibold">Pagamento</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow
                key={sale.id}
                className="group hover:bg-secondary/30 transition-colors"
              >
                <TableCell className="font-mono text-sm font-medium">
                  {sale.id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{sale.date}</p>
                    <p className="text-xs text-muted-foreground">{sale.time}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-rose flex items-center justify-center text-white font-medium text-xs">
                      {sale.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-sm">{sale.customer}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sale.items} {sale.items === 1 ? "item" : "itens"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {sale.payment}
                </TableCell>
                <TableCell className="font-semibold">
                  R$ {sale.total.toFixed(2).replace(".", ",")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusConfig[sale.status as keyof typeof statusConfig].className}
                  >
                    {statusConfig[sale.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredSales.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma venda encontrada.</p>
          </div>
        )}
      </Card>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Mostrando {filteredSales.length} de {salesData.length} vendas
        </span>
        <span className="font-semibold">
          Total: R$ {totalFiltered.toFixed(2).replace(".", ",")}
        </span>
      </div>
      </div>
    </>
  );
};

export default Vendas;
