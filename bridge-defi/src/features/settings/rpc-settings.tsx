"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChainIcon } from "@/components/common/chain-icon";
import { useSettingsStore } from "@/store/settings-store";
import { defaultRpcEndpoints } from "@/config/env";
import { EVM_CHAINS, CHAINS } from "@/lib/chains/registry";
import type { ChainId } from "@/types/chain";

// The chains whose RPC the user can configure (EVM + the non-EVM send chains).
const CONFIGURABLE: ChainId[] = [
  ...EVM_CHAINS.map((c) => c.id),
  "solana",
  "xrp",
  "sui",
];

function RpcRow({ chainId }: { chainId: ChainId }) {
  const chain = CHAINS[chainId];
  const resolveRpc = useSettingsStore((s) => s.resolveRpc);
  const setRpcOverride = useSettingsStore((s) => s.setRpcOverride);
  const resetRpcOverride = useSettingsStore((s) => s.resetRpcOverride);

  const [value, setValue] = useState(resolveRpc(chainId));
  const isDefault = value === (defaultRpcEndpoints[chainId] ?? "");

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <ChainIcon chain={chain} size="sm" />
        {chain.name}
      </Label>
      <div className="flex gap-2">
        <Input
          value={value}
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
          placeholder={defaultRpcEndpoints[chainId]}
          className="font-mono text-xs"
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Save RPC"
          onClick={() => {
            setRpcOverride(chainId, value);
            toast.success(`${chain.name} RPC saved`);
          }}
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Reset to default"
          disabled={isDefault}
          onClick={() => {
            resetRpcOverride(chainId);
            setValue(defaultRpcEndpoints[chainId] ?? "");
            toast.info(`${chain.name} RPC reset to default`);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function RpcSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>RPC endpoints</CardTitle>
        <CardDescription>
          Bridge.defi reads chain data and broadcasts signed transactions
          through these endpoints. Use private providers (Alchemy, Infura,
          QuickNode, Helius) for production reliability.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        {CONFIGURABLE.map((id) => (
          <RpcRow key={id} chainId={id} />
        ))}
      </CardContent>
    </Card>
  );
}
