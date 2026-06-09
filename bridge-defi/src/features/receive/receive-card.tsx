"use client";

import { useState } from "react";
import { AlertCircle, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChainSelect } from "@/components/common/chain-select";
import { ChainIcon } from "@/components/common/chain-icon";
import { CopyButton } from "@/components/common/copy-button";
import { QrCode } from "./qr-code";
import { useAddresses } from "./use-addresses";
import { CHAINS, CHAIN_LIST } from "@/lib/chains/registry";
import type { ChainId } from "@/types/chain";

export function ReceiveCard() {
  const [chainId, setChainId] = useState<ChainId>("ethereum");
  const { data, isLoading, isError, error, refetch } = useAddresses();

  const chain = CHAINS[chainId];
  const address = data?.[chainId];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receive assets</CardTitle>
        <CardDescription>
          Choose a network, then share your address or QR code. The same EVM
          address works on Ethereum, Arbitrum, Base, Polygon, BNB Chain and
          Optimism.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Network</Label>
          <ChainSelect
            value={chainId}
            onChange={setChainId}
            chains={CHAIN_LIST}
          />
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/40 p-6 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Could not load addresses."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <ChainIcon chain={chain} size="md" />
              <span className="font-medium">{chain.name}</span>
              <Badge variant="secondary">{chain.symbol}</Badge>
            </div>

            {isLoading || !address ? (
              <Skeleton className="h-[200px] w-[200px] rounded-xl" />
            ) : (
              <QrCode value={address} size={200} />
            )}

            <div className="w-full space-y-2">
              <Label className="text-xs text-muted-foreground">
                Your {chain.name} address
              </Label>
              {isLoading || !address ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
                  <code className="min-w-0 flex-1 break-all font-mono text-sm">
                    {address}
                  </code>
                  <CopyButton value={address} label={`${chain.name} address`} />
                </div>
              )}
            </div>

            {address && chain.addressExplorer && (
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={`${chain.addressExplorer}${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
