import type { ChainMeta } from "@/types/chain";
import { cn } from "@/lib/utils";

interface ChainIconProps {
  chain: ChainMeta;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES: Record<NonNullable<ChainIconProps["size"]>, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

/**
 * A compact, dependency-free chain glyph: a tinted circle with the chain's
 * two-letter badge. Avoids shipping a logo sprite while staying recognizable.
 */
export function ChainIcon({ chain, size = "md", className }: ChainIconProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold uppercase ring-1 ring-inset ring-border/50",
        SIZES[size],
        chain.accent,
        className,
      )}
      aria-hidden
    >
      {chain.badge}
    </div>
  );
}
