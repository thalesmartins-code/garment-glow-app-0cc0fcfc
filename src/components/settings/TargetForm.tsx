import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface TargetFormProps {
  targetValue: number;
  onTargetValueChange: (value: number) => void;
}

export function TargetForm({ targetValue, onTargetValueChange }: TargetFormProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = parseFloat(rawValue) / 100;
    onTargetValueChange(isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Meta de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-value">Meta Total do Mês</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <Input
              id="target-value"
              type="text"
              value={targetValue > 0 ? formatCurrency(targetValue).replace("R$", "").trim() : ""}
              onChange={handleInputChange}
              placeholder="0,00"
              className="pl-10 text-lg font-semibold"
            />
          </div>
        </div>
        
        {targetValue > 0 && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground">Meta configurada:</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(targetValue)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
