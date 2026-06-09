"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string;
  label?: string;
  /** Show text label next to the icon. */
  withLabel?: boolean;
}

export function CopyButton({
  value,
  label = "address",
  withLabel = false,
  variant = "outline",
  size = "icon",
  className,
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useCopy();

  return (
    <Button
      type="button"
      variant={variant}
      size={withLabel ? "sm" : size}
      className={cn(className)}
      onClick={async () => {
        const ok = await copy(value);
        toast[ok ? "success" : "error"](
          ok ? `Copied ${label}` : `Could not copy ${label}`,
        );
      }}
      aria-label={`Copy ${label}`}
      {...props}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {withLabel && <span>{copied ? "Copied" : "Copy"}</span>}
    </Button>
  );
}
