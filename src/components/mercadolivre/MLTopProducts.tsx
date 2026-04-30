import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { ProductSalesRow } from "./TopSellingProducts";

interface MLTopProductsProps {
  products: (ProductSalesRow & { _marketplace?: string })[];
}

function MLTopProductsImpl({ products }: MLTopProductsProps) {
  const handleExport = () => {
    if (!products.length) return;
    const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
    const rows = products.map((p, i) => ({
      "#": i + 1,
      "Item ID": p.item_id,
      "Título": p.title,
      "Loja": (p as any)._marketplace ?? "—",
      "Qtd. Vendida": p.qty_sold,
      "Receita (R$)": Number(p.revenue.toFixed(2)),
      "% Participação": totalRevenue > 0 ? Number(((p.revenue / totalRevenue) * 100).toFixed(2)) : 0,
      "Estoque": p.available_quantity ?? "—",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Top Anúncios");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `top-anuncios-${stamp}.xlsx`);
  };

  return (
    <motion.div className="lg:col-span-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
      <Card className="h-full">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Top Anúncios</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{products.length} produtos</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={!products.length}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Exportar para Excel"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
        <CardContent className="px-4 pb-4">
          {products.length > 0 ? (
            <div className="space-y-0">
              <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                <span className="w-5" />
                <span className="w-7" />
                <span className="flex-1">Produto</span>
                <span className="w-14 text-right">Vendidos</span>
                <span className="w-20 text-right">Receita</span>
                <span className="w-12 text-right">% Part.</span>
                <span className="w-14 text-right">Estoque</span>
              </div>
              {(() => {
                const top5 = products.slice(0, 5);
                const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
                return top5.map((p, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const medal = i < 3 ? medals[i] : null;
                  const share = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
                  return (
                    <div key={p.item_id || i} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                      <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
                        {medal ?? `${i + 1}`}
                      </span>
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt="" loading="lazy" decoding="async" className="w-7 h-7 rounded object-cover flex-shrink-0" />
                      ) : (
                        <span className="w-7 h-7 rounded bg-muted flex-shrink-0" />
                      )}
                      {p.item_id ? (
                        <a
                          href={`https://produto.mercadolivre.com.br/${p.item_id.replace(/^(MLB)(\d+)/, "$1-$2")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-foreground truncate flex-1 leading-tight hover:text-primary hover:underline transition-colors"
                        >
                          {p.title}
                        </a>
                      ) : (
                        <span className="text-xs text-foreground truncate flex-1 leading-tight">{p.title}</span>
                      )}
                      <span className="w-14 text-right text-xs font-semibold tabular-nums text-foreground">
                        {p.qty_sold.toLocaleString("pt-BR")}
                      </span>
                      <span className="w-20 text-right text-xs font-semibold tabular-nums text-foreground">
                        {p.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                      <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                        {share.toFixed(1)}%
                      </span>
                      <span className="w-14 text-right text-[10px] text-muted-foreground whitespace-nowrap">
                        {p.available_quantity != null ? `${p.available_quantity} un` : "—"}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">Sem dados</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export const MLTopProducts = memo(MLTopProductsImpl);
