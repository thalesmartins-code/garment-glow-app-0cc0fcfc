import React, { useCallback, useState } from "react";
import { Upload, FileText, X, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileType } from "@/utils/csvParser";

interface FileUploaderProps {
  onFileSelect: (content: string | ArrayBuffer, fileType: "csv" | "excel") => void;
  acceptedFormats?: string;
  disabled?: boolean;
}

export function FileUploader({
  onFileSelect,
  acceptedFormats = ".csv,.xlsx,.xls",
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const fileType = getFileType(file.name);
      
      if (fileType === "unknown") {
        alert("Por favor, selecione um arquivo CSV ou Excel (.xlsx, .xls)");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          if (fileType === "csv") {
            onFileSelect(result as string, "csv");
          } else {
            onFileSelect(result as ArrayBuffer, "excel");
          }
        }
      };

      if (fileType === "csv") {
        reader.readAsText(file, "UTF-8");
      } else {
        reader.readAsArrayBuffer(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const isExcel = selectedFile && getFileType(selectedFile.name) === "excel";

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload
              className={cn(
                "w-10 h-10 mb-3",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Clique para selecionar</span> ou
              arraste o arquivo
            </p>
            <p className="text-xs text-muted-foreground/70">
              Arquivos CSV ou Excel (.xlsx, .xls)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedFormats}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 border border-muted rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {isExcel ? (
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              ) : (
                <FileText className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            title="Remover arquivo"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
