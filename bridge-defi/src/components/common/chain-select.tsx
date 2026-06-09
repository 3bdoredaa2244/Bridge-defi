"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChainIcon } from "./chain-icon";
import { CHAINS } from "@/lib/chains/registry";
import type { ChainId, ChainMeta } from "@/types/chain";

interface ChainSelectProps {
  value: ChainId;
  onChange: (id: ChainId) => void;
  /** Which chains to offer. */
  chains: ChainMeta[];
  placeholder?: string;
  disabled?: boolean;
}

export function ChainSelect({
  value,
  onChange,
  chains,
  placeholder = "Select a chain",
  disabled,
}: ChainSelectProps) {
  const selected = CHAINS[value];

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as ChainId)}
      disabled={disabled}
    >
      <SelectTrigger className="h-12">
        <SelectValue placeholder={placeholder}>
          {selected && (
            <span className="flex items-center gap-2.5">
              <ChainIcon chain={selected} size="sm" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-medium">{selected.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selected.symbol}
                </span>
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id} className="py-2">
            <span className="flex items-center gap-2.5">
              <ChainIcon chain={chain} size="sm" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-medium">{chain.name}</span>
                <span className="text-xs text-muted-foreground">
                  {chain.symbol}
                </span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
