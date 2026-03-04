import React, { useState, useMemo } from "react";
import { Trash2, Search, Filter } from "lucide-react";
import { ImportedSale } from "@/types/import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportHistoryProps {
  sellerId: string;
  sellerName: string;
  data: ImportedSale[];
  onDeleteRecord: (record: ImportedSale) => void;
}

const ITEMS_PER_PAGE = 20;

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function ImportHistory({ sellerId, sellerName, data, onDeleteRecord }: ImportHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterMarketplace, setFilterMarketplace] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique values for filters
  const availableYears = useMemo(() => {
    const years = [...new Set(data.map((d) => d.ano))];
    return years.sort((a, b) => b - a);
  }, [data]);

  const availableMonths = useMemo(() => {
    const months = [...new Set(data.map((d) => d.mes))];
    return months.sort((a, b) => a - b);
  }, [data]);

  const availableMarketplaces = useMemo(() => {
    return [...new Set(data.map((d) => d.marketplace))].sort();
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    if (filterYear !== "all") {
      result = result.filter((d) => d.ano === parseInt(filterYear));
    }

    if (filterMonth !== "all") {
      result = result.filter((d) => d.mes === parseInt(filterMonth));
    }

    if (filterMarketplace !== "all") {
      result = result.filter((d) => d.marketplace === filterMarketplace);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.marketplace.toLowerCase().includes(query) ||
          d.vendaTotal.toString().includes(query)
      );
    }

    // Sort by date (newest first)
    result.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      if (a.mes !== b.mes) return b.mes - a.mes;
      return b.dia - a.dia;
    });

    return result;
  }, [data, filterYear, filterMonth, filterMarketplace, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterYear, filterMonth, filterMarketplace, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleClearFilters = () => {
    setFilterYear("all");
    setFilterMonth("all");
    setFilterMarketplace("all");
    setSearchQuery("");
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground text-center">
            <p className="text-lg font-medium">Nenhum registro encontrado</p>
            <p className="text-sm mt-1">
              Importe dados para {sellerName} na aba "Importar"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Histórico de Registros - {sellerName}</CardTitle>
          <CardDescription>
            {filteredData.length} de {data.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros:</span>
            </div>
            
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {MONTH_NAMES[month - 1]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterMarketplace} onValueChange={setFilterMarketplace}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Marketplace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableMarketplaces.map((mp) => (
                  <SelectItem key={mp} value={mp}>
                    {mp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {(filterYear !== "all" || filterMonth !== "all" || filterMarketplace !== "all" || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>Dia</TableHead>
                  <TableHead className="text-right">Venda Bruta Aprovada</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record, index) => (
                  <TableRow key={`${record.marketplace}-${record.ano}-${record.mes}-${record.dia}-${index}`}>
                    <TableCell className="font-medium">{record.marketplace}</TableCell>
                    <TableCell>{record.ano}</TableCell>
                    <TableCell>{MONTH_NAMES[record.mes - 1]}</TableCell>
                    <TableCell>{record.dia}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.vendaTotal)}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deseja excluir o registro de {record.marketplace} do dia {record.dia}/{record.mes}/{record.ano}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteRecord(record)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} registros
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}