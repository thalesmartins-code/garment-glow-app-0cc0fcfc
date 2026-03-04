import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Pencil, Trash2, Shield, Users, UserCheck, UserX, Key,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "ativo" | "inativo" | "ferias";
  avatar: string;
  permissions: string[];
  restrictions: string[];
  createdAt: string;
}

const allPermissions: Permission[] = [
  { id: "view_dashboard", name: "Ver Dashboard", description: "Acesso ao painel principal", category: "Dashboard" },
  { id: "view_sales", name: "Ver Vendas", description: "Visualizar histórico de vendas", category: "Vendas" },
  { id: "create_sale", name: "Criar Venda", description: "Registrar novas vendas", category: "Vendas" },
  { id: "edit_sale", name: "Editar Venda", description: "Modificar vendas existentes", category: "Vendas" },
  { id: "delete_sale", name: "Excluir Venda", description: "Remover vendas do sistema", category: "Vendas" },
  { id: "refund_sale", name: "Reembolsar Venda", description: "Processar reembolsos", category: "Vendas" },
  { id: "view_products", name: "Ver Produtos", description: "Visualizar catálogo de produtos", category: "Produtos" },
  { id: "create_product", name: "Criar Produto", description: "Adicionar novos produtos", category: "Produtos" },
  { id: "edit_product", name: "Editar Produto", description: "Modificar produtos existentes", category: "Produtos" },
  { id: "delete_product", name: "Excluir Produto", description: "Remover produtos do catálogo", category: "Produtos" },
  { id: "manage_stock", name: "Gerenciar Estoque", description: "Ajustar níveis de estoque", category: "Produtos" },
  { id: "view_customers", name: "Ver Clientes", description: "Visualizar lista de clientes", category: "Clientes" },
  { id: "create_customer", name: "Criar Cliente", description: "Cadastrar novos clientes", category: "Clientes" },
  { id: "edit_customer", name: "Editar Cliente", description: "Modificar dados de clientes", category: "Clientes" },
  { id: "delete_customer", name: "Excluir Cliente", description: "Remover clientes do sistema", category: "Clientes" },
  { id: "view_reports", name: "Ver Relatórios", description: "Acessar relatórios e métricas", category: "Relatórios" },
  { id: "export_reports", name: "Exportar Relatórios", description: "Baixar relatórios em PDF/Excel", category: "Relatórios" },
  { id: "view_employees", name: "Ver Funcionários", description: "Visualizar lista de funcionários", category: "Administração" },
  { id: "manage_employees", name: "Gerenciar Funcionários", description: "Adicionar/remover funcionários", category: "Administração" },
  { id: "manage_permissions", name: "Gerenciar Permissões", description: "Configurar permissões de acesso", category: "Administração" },
  { id: "view_settings", name: "Ver Configurações", description: "Acessar configurações do sistema", category: "Administração" },
  { id: "edit_settings", name: "Editar Configurações", description: "Modificar configurações do sistema", category: "Administração" },
];

const allRestrictions = [
  { id: "no_discount", name: "Sem Desconto", description: "Não pode aplicar descontos" },
  { id: "max_discount_10", name: "Desconto Máximo 10%", description: "Limite de 10% de desconto" },
  { id: "no_refund", name: "Sem Reembolso", description: "Não pode processar reembolsos" },
  { id: "sales_limit", name: "Limite de Vendas", description: "Máximo 50 vendas por dia" },
  { id: "no_delete", name: "Sem Exclusão", description: "Não pode excluir registros" },
  { id: "approval_required", name: "Aprovação Necessária", description: "Ações precisam de aprovação" },
  { id: "working_hours", name: "Horário Comercial", description: "Acesso apenas em horário comercial" },
  { id: "no_export", name: "Sem Exportação", description: "Não pode exportar dados" },
];

const mockEmployees: Employee[] = [
  {
    id: "1", name: "Carlos Silva", email: "carlos@modasstore.com", role: "Gerente", department: "Vendas", status: "ativo", avatar: "",
    permissions: ["view_dashboard", "view_sales", "create_sale", "edit_sale", "view_products", "view_customers", "view_reports", "view_employees"],
    restrictions: ["no_delete"], createdAt: "2024-01-15",
  },
  {
    id: "2", name: "Ana Oliveira", email: "ana@modasstore.com", role: "Vendedora", department: "Vendas", status: "ativo", avatar: "",
    permissions: ["view_dashboard", "view_sales", "create_sale", "view_products", "view_customers"],
    restrictions: ["max_discount_10", "no_refund", "no_delete"], createdAt: "2024-02-20",
  },
  {
    id: "3", name: "Roberto Santos", email: "roberto@modasstore.com", role: "Estoquista", department: "Estoque", status: "ativo", avatar: "",
    permissions: ["view_dashboard", "view_products", "manage_stock"],
    restrictions: ["no_delete", "no_export"], createdAt: "2024-03-10",
  },
  {
    id: "4", name: "Maria Costa", email: "maria@modasstore.com", role: "Administradora", department: "Administração", status: "ativo", avatar: "",
    permissions: allPermissions.map(p => p.id), restrictions: [], createdAt: "2023-06-01",
  },
  {
    id: "5", name: "Pedro Lima", email: "pedro@modasstore.com", role: "Vendedor", department: "Vendas", status: "ferias", avatar: "",
    permissions: ["view_dashboard", "view_sales", "create_sale", "view_products"],
    restrictions: ["max_discount_10", "no_refund", "sales_limit"], createdAt: "2024-04-05",
  },
  {
    id: "6", name: "Juliana Mendes", email: "juliana@modasstore.com", role: "Atendente", department: "Atendimento", status: "inativo", avatar: "",
    permissions: ["view_dashboard", "view_customers", "create_customer"],
    restrictions: ["no_delete", "approval_required"], createdAt: "2024-01-30",
  },
];

const roles = ["Administrador", "Gerente", "Vendedor", "Vendedora", "Estoquista", "Atendente", "Caixa"];
const departments = ["Administração", "Vendas", "Estoque", "Atendimento", "Financeiro"];

export default function Funcionarios() {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [departmentFilter, setDepartmentFilter] = useState("todos");
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "todos" || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === "todos" || employee.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>;
      case "inativo":
        return <Badge variant="secondary">Inativo</Badge>;
      case "ferias":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Férias</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenPermissions = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedPermissions([...employee.permissions]);
    setSelectedRestrictions([...employee.restrictions]);
    setIsPermissionsOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleRestriction = (restrictionId: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restrictionId)
        ? prev.filter(r => r !== restrictionId)
        : [...prev, restrictionId]
    );
  };

  const permissionCategories = [...new Set(allPermissions.map(p => p.category))];

  const activeCount = employees.filter(e => e.status === "ativo").length;
  const inactiveCount = employees.filter(e => e.status === "inativo").length;
  const onVacationCount = employees.filter(e => e.status === "ferias").length;

  return (
    <>
      <PageHeader title="Funcionários" subtitle="Gerencie sua equipe e configure permissões de acesso" />
      <div className="p-8">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-end">
          <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-rose hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Funcionário</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo funcionário
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Nome do funcionário" className="bg-secondary/50 border-0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" className="bg-secondary/50 border-0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Cargo</Label>
                    <Select>
                      <SelectTrigger className="bg-secondary/50 border-0">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role.toLowerCase()}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Select>
                      <SelectTrigger className="bg-secondary/50 border-0">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept.toLowerCase()}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Funcionário Ativo</Label>
                  <Switch id="active" defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewEmployeeOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-rose hover:opacity-90" onClick={() => setIsNewEmployeeOpen(false)}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activeCount}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Férias</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{onVacationCount}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou cargo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-0"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                  <SelectItem value="ferias">Em Férias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">Funcionário</TableHead>
                  <TableHead className="font-semibold">Cargo</TableHead>
                  <TableHead className="font-semibold">Departamento</TableHead>
                  <TableHead className="font-semibold">Permissões</TableHead>
                  <TableHead className="font-semibold">Restrições</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="group hover:bg-secondary/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-gradient-rose text-white text-xs font-medium">
                            {employee.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{employee.role}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{employee.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {employee.permissions.length} permissões
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {employee.restrictions.length > 0 ? (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                            {employee.restrictions.length} restrições
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Nenhuma</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenPermissions(employee)}>
                            <Key className="h-4 w-4 mr-2" />
                            Permissões
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredEmployees.length} de {employees.length} funcionários
        </div>
      </div>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissões — {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              Configure as permissões e restrições de acesso
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="permissions" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
              <TabsTrigger value="restrictions">Restrições</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-6 mt-4">
              {permissionCategories.map((category) => (
                <div key={category}>
                  <h4 className="font-medium text-sm mb-3 text-muted-foreground">{category}</h4>
                  <div className="grid gap-3">
                    {allPermissions
                      .filter((p) => p.category === category)
                      .map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <div className="flex-1">
                            <label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                              {permission.name}
                            </label>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="restrictions" className="space-y-4 mt-4">
              {allRestrictions.map((restriction) => (
                <div key={restriction.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={restriction.id}
                    checked={selectedRestrictions.includes(restriction.id)}
                    onCheckedChange={() => toggleRestriction(restriction.id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={restriction.id} className="text-sm font-medium cursor-pointer">
                      {restriction.name}
                    </label>
                    <p className="text-xs text-muted-foreground">{restriction.description}</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-gradient-rose hover:opacity-90" onClick={() => setIsPermissionsOpen(false)}>
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
