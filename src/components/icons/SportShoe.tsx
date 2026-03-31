import type { LucideProps } from "lucide-react";
import { forwardRef } from "react";

/**
 * Custom sneaker/sport-shoe icon matching Lucide's style.
 * 24×24 viewBox, stroke-based, no fill.
 */
export const SportShoe = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = "currentColor", size = 24, strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 18h18a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3l-2-3-3 1-2-2-3 1-2-2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 1 1.73V18Z" />
      <path d="M5 14v-1.5a2 2 0 0 1 2-2l1.5.5 2-1 2 1.5 2-1L17 13" />
      <line x1="3" y1="18" x2="22" y2="18" />
    </svg>
  )
);

SportShoe.displayName = "SportShoe";
