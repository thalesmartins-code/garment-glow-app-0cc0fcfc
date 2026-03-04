import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: LucideIcon;
  variant?: "default" | "accent";
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  variant = "default",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg",
        variant === "accent"
          ? "bg-gradient-primary text-white"
          : "bg-card border-0 shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "accent" ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  variant === "accent"
                    ? "text-white/90"
                    : change.positive
                    ? "text-success"
                    : "text-destructive"
                )}
              >
                {change.positive ? "+" : ""}
                {change.value}
              </span>
              <span
                className={cn(
                  "text-xs",
                  variant === "accent" ? "text-white/60" : "text-muted-foreground"
                )}
              >
                vs mês anterior
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            variant === "accent"
              ? "bg-white/20"
              : "bg-secondary"
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6",
              variant === "accent" ? "text-white" : "text-accent"
            )}
          />
        </div>
      </div>

      {/* Decorative element */}
      {variant === "accent" && (
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
      )}
    </div>
  );
}
