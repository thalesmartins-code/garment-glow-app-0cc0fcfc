import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClass = () => {
    if (percentage >= 100) return "progress-success";
    if (percentage >= 80) return "progress-info";
    if (percentage >= 60) return "progress-warning";
    return "progress-danger";
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-1.5";
      case "lg":
        return "h-3";
      default:
        return "h-2";
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("progress-bar flex-1", getSizeClass())}>
        <div
          className={cn("progress-fill", getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-right">
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
