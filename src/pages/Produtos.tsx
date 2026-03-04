import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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

const categories = [
  { value: "all", label: "Todas Categorias" },
  { value: "vestidos", label: "Vestidos" },
  { value: "camisas", label: "Camisas" },
  { value: "calcas", label: "Calças" },
  { value: "saias", label: "Saias" },
  { value: "acessorios", label: "Acessórios" },
  { value: "sapatos", label: "Sapatos" },
];

const products = [
  {
    id: 1,
    name: "Vestido Floral Primavera",
    category: "vestidos",
    price: 289.9,
    stock: 12,
    status: "active",
    image: "🌸",
  },
  {
    id: 2,
    name: "Camisa Social Slim",
    category: "camisas",
    price: 159.9,
    stock: 25,
    status: "active",
    image: "👔",
  },
  {
    id: 3,
    name: "Calça Jeans Skinny",
    category: "calcas",
    price: 199.9,
    stock: 8,
    status: "low_stock",
    image: "👖",
  },
  {
    id: 4,
    name: "Blazer Executivo",
    category: "camisas",
    price: 459.9,
    stock: 5,
    status: "low_stock",
    image: "🧥",
  },
  {
    id: 5,
    name: "Saia Midi Plissada",
    category: "saias",
    price: 179.9,
    stock: 18,
    status: "active",
    image: "👗",
  },
  {
    id: 6,
    name: "Bolsa Couro Premium",
    category: "acessorios",
    price: 349.9,
    stock: 0,
    status: "out_of_stock",
    image: "👜",
  },
  {
    id: 7,
    name: "Scarpin Salto Alto",
    category: "sapatos",
    price: 229.9,
    stock: 14,
    status: "active",
    image: "👠",
  },
  {
    id: 8,
    name: "Vestido Longo Festa",
    category: "vestidos",
    price: 599.9,
    stock: 6,
    status: "active",
    image: "✨",
  },
  {
    id: 9,
    name: "Cinto Couro Legítimo",
    category: "acessorios",
    price: 89.9,
    stock: 32,
    status: "active",
    image: "🪢",
  },
  {
    id: 10,
    name: "Calça Alfaiataria",
    category: "calcas",
    price: 279.9,
    stock: 3,
    status: "low_stock",
    image: "👖",
  },
];

const statusConfig = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-0" },
  low_stock: { label: "Estoque Baixo", className: "bg-warning/10 text-warning border-0" },
  out_of_stock: { label: "Sem Estoque", className: "bg-destructive/10 text-destructive border-0" },
};

const Produtos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout
      title="Produtos"
      subtitle="Gerencie o catálogo de produtos da sua loja"
    >
      {/* Filters Bar */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-0"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary/50 border-0">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add Product Button */}
            <Button className="bg-gradient-rose hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-semibold">Produto</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Preço</TableHead>
              <TableHead className="font-semibold">Estoque</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow
                key={product.id}
                className="group hover:bg-secondary/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
                      {product.image}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {categories.find((c) => c.value === product.category)?.label}
                </TableCell>
                <TableCell className="font-semibold">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      product.stock <= 5
                        ? "text-destructive font-medium"
                        : product.stock <= 10
                        ? "text-warning font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {product.stock} un.
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusConfig[product.status as keyof typeof statusConfig].className}
                  >
                    {statusConfig[product.status as keyof typeof statusConfig].label}
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
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        )}
      </Card>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredProducts.length} de {products.length} produtos
      </div>
    </DashboardLayout>
  );
};

export default Produtos;
