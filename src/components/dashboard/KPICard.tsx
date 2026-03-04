import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { useMemo } from "react";

type CardVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral" | "purple" | "orange";

interface KPICardProps {
  title: string;
  value: string;
  rawValue?: number; // For animation - the raw numeric value
  subtitle?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  variant?: CardVariant;
  animateValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  valueDecimals?: number;
}

const variantStyles: Record<CardVariant, { card: string; icon: string; value: string; glow: string }> = {
  default: {
    card: "",
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
    glow: "hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]",
  },
  success: {
    card: "border-l-4 border-l-success",
    icon: "bg-success/10 text-success",
    value: "text-success",
    glow: "hover:shadow-[0_0_20px_hsl(var(--success)/0.15)]",
  },
  warning: {
    card: "border-l-4 border-l-warning",
    icon: "bg-warning/10 text-warning",
    value: "text-warning",
    glow: "hover:shadow-[0_0_20px_hsl(var(--warning)/0.15)]",
  },
  danger: {
    card: "border-l-4 border-l-destructive",
    icon: "bg-destructive/10 text-destructive",
    value: "text-destructive",
    glow: "hover:shadow-[0_0_20px_hsl(var(--destructive)/0.15)]",
  },
  info: {
    card: "border-l-4 border-l-primary",
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
    glow: "hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]",
  },
  neutral: {
    card: "border-l-4 border-l-muted-foreground",
    icon: "bg-muted text-muted-foreground",
    value: "text-muted-foreground",
    glow: "hover:shadow-[0_0_20px_hsl(var(--muted)/0.15)]",
  },
  purple: {
    card: "border-l-4 border-l-[hsl(270,70%,50%)]",
    icon: "bg-[hsl(270,70%,50%)]/10 text-[hsl(270,70%,50%)]",
    value: "text-[hsl(270,70%,50%)]",
    glow: "hover:shadow-[0_0_20px_hsl(270,70%,50%,0.15)]",
  },
  orange: {
    card: "border-l-4 border-l-[hsl(25,95%,53%)]",
    icon: "bg-[hsl(25,95%,53%)]/10 text-[hsl(25,95%,53%)]",
    value: "text-[hsl(25,95%,53%)]",
    glow: "hover:shadow-[0_0_20px_hsl(25,95%,53%,0.15)]",
  },
};

export function KPICard({
  title,
  value,
  rawValue,
  subtitle,
  delta,
  deltaLabel,
  icon,
  loading = false,
  className,
  variant = "default",
  animateValue = true,
  valuePrefix = "",
  valueSuffix = "",
  valueDecimals = 0,
}: KPICardProps) {
  // Animate the raw value if provided
  const animatedRawValue = useCountAnimation(
    animateValue && rawValue !== undefined ? rawValue : 0,
    { duration: 1500, delay: 100 }
  );

  // Format the animated value
  const displayValue = useMemo(() => {
    if (!animateValue || rawValue === undefined) {
      return value;
    }
    
    const formattedNumber = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: valueDecimals,
      maximumFractionDigits: valueDecimals,
    }).format(animatedRawValue);
    
    return `${valuePrefix}${formattedNumber}${valueSuffix}`;
  }, [animateValue, rawValue, value, animatedRawValue, valuePrefix, valueSuffix, valueDecimals]);

  const getDeltaClass = () => {
    if (delta === undefined) return "kpi-delta-neutral";
    if (delta > 0) return "kpi-delta-positive";
    if (delta < 0) return "kpi-delta-negative";
    return "kpi-delta-neutral";
  };

  const getDeltaIcon = () => {
    if (delta === undefined) return null;
    if (delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const styles = variantStyles[variant];

  if (loading) {
    return (
      <div className={cn("kpi-card", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-8 bg-muted rounded w-32 animate-pulse" />
            <div className="h-3 bg-muted rounded w-20 animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "kpi-card animate-slide-up transition-all duration-300 hover:scale-[1.02]",
        styles.card, 
        styles.glow,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="kpi-label">{title}</p>
          <p className={cn("text-lg sm:text-xl font-bold tracking-tight truncate", styles.value)}>
            {displayValue}
          </p>
          {(delta !== undefined || subtitle) && (
            <div className="flex items-center gap-2 mt-2">
              {delta !== undefined && (
                <span className={cn(getDeltaClass(), "transition-transform duration-200")}>
                  {getDeltaIcon()}
                  {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                </span>
              )}
              {deltaLabel && (
                <span className="text-xs text-muted-foreground">{deltaLabel}</span>
              )}
              {subtitle && !delta && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div 
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
              styles.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
