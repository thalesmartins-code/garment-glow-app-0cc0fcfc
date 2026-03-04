import React from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCSVTemplate, downloadCSV, generateExcelTemplate } from "@/utils/csvParser";
import { VALID_MARKETPLACES } from "@/types/import";

export function CSVTemplate() {
  const handleDownloadCSV = () => {
    const template = generateCSVTemplate();
    downloadCSV(template, "template_vendas.csv");
  };

  const handleDownloadExcel = () => {
    generateExcelTemplate();
  };

  return (
    <div className="p-4 bg-muted/30 border border-muted rounded-lg space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-1">Templates</h4>
          <p className="text-xs text-muted-foreground">
            Baixe o template em CSV ou Excel e preencha com seus dados de vendas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Colunas obrigatórias:
          </p>
          <div className="flex flex-wrap gap-1">
            {["marketplace", "ano", "mes", "dia", "venda_total"].map((col) => (
              <span
                key={col}
                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Marketplaces aceitos:
          </p>
          <div className="flex flex-wrap gap-1">
            {VALID_MARKETPLACES.map((mp) => (
              <span
                key={mp}
                className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
              >
                {mp}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Formatos aceitos:
          </p>
          <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
            <li>CSV (separador: ; ou ,)</li>
            <li>Excel (.xlsx, .xls)</li>
            <li>Codificação: UTF-8</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadExcel}
          className="w-full"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Baixar Template Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCSV}
          className="w-full"
        >
          <FileText className="w-4 h-4 mr-2" />
          Baixar Template CSV
        </Button>
      </div>
    </div>
  );
}
