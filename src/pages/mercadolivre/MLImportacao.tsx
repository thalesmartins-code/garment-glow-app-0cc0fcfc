import { useState, useCallback } from "react";
import { Upload, ShoppingBag, Package, Store, FileText, FileSpreadsheet, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getFileType } from "@/utils/csvParser";
import { parseMarketplaceFile, type MarketplaceType, type ParsedImportRow } from "@/utils/marketplaceParsers";

const marketplaces: { id: MarketplaceType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "shopee", label: "Shopee", icon: ShoppingBag, color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  { id: "amazon", label: "Amazon", icon: Package, color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" },
  { id: "magalu", label: "Magalu", icon: Store, color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
];

export default function MLImportacao() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFile = useCallback((file: File) => {
    const fileType = getFileType(file.name);
    if (fileType === "unknown") {
      setParseError("Formato de arquivo não suportado. Use CSV ou Excel.");
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setParsedData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || !selectedMarketplace) return;

      try {
        const data = parseMarketplaceFile(selectedMarketplace, result, fileType as "csv" | "excel");
        setParsedData(data);
      } catch (err: any) {
        setParseError(err.message || "Erro ao processar arquivo.");
      }
    };

    if (fileType === "csv") {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [selectedMarketplace]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
  }, [handleFile]);

  const clearFile = () => {
    setSelectedFile(null);
    setParsedData([]);
    setParseError(null);
  };

  const handleImport = async () => {
    if (!parsedData.length || !selectedMarketplace) return;
    setImporting(true);
    // TODO: save to Supabase table after sample files define the schema
    setTimeout(() => {
      setImporting(false);
      clearFile();
    }, 1500);
  };

  const isExcel = selectedFile && getFileType(selectedFile.name) === "excel";
  const mp = marketplaces.find(m => m.id === selectedMarketplace);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Importação</h1>
        <p className="text-muted-foreground">Importe dados de vendas da Shopee, Amazon e Magalu a partir dos relatórios nativos.</p>
      </div>

      {/* Marketplace selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {marketplaces.map((m) => (
          <button
            key={m.id}
            onClick={() => { setSelectedMarketplace(m.id); clearFile(); }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
              selectedMarketplace === m.id
                ? `${m.color} border-current shadow-sm`
                : "border-muted hover:border-muted-foreground/30 bg-card"
            )}
          >
            <m.icon className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">Relatório de vendas</p>
            </div>
          </button>
        ))}
      </div>

      {/* Upload area */}
      {selectedMarketplace && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload — {mp?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <label
                className={cn(
                  "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
              >
                <Upload className={cn("w-10 h-10 mb-3", isDragging ? "text-primary" : "text-muted-foreground")} />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Clique para selecionar</span> ou arraste o arquivo
                </p>
                <p className="text-xs text-muted-foreground/70">CSV ou Excel (.xlsx, .xls)</p>
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleInputChange} />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-muted rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {isExcel ? <FileSpreadsheet className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button onClick={clearFile} className="p-1 hover:bg-muted rounded-full transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {parseError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {parseError}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Preview — {parsedData.length} linhas
            </CardTitle>
            <Badge variant="secondary">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Pronto para importar
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead>Produto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 50).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                      <TableCell className="font-mono text-xs">{row.orderId || "—"}</TableCell>
                      <TableCell className="text-right">
                        {row.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-right">{row.quantity}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{row.productTitle || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleImport} disabled={importing}>
                {importing ? "Importando..." : `Importar ${parsedData.length} linhas`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
