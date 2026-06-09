"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChainIcon } from "@/components/common/chain-icon";
import { useSettingsStore } from "@/store/settings-store";
import { CHAINS } from "@/lib/chains/registry";
import { formatTokenAmount, formatUsd } from "@/lib/format";
import type { ChainBalance } from "@/types";
import type { PortfolioView } from "./use-portfolio";

function AssetRow({ asset }: { asset: ChainBalance }) {
  const chain = CHAINS[asset.chainId];
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ChainIcon chain={chain} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{chain.name}</p>
          <p className="text-xs text-muted-foreground">{chain.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        {asset.errored ? (
          <span className="flex items-center gap-1 text-xs text-warning">
            <AlertCircle className="h-3.5 w-3.5" />
            Unavailable
          </span>
        ) : (
          <>
            <p className="text-sm font-medium">
              {formatTokenAmount(asset.amount)} {chain.symbol}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatUsd(asset.usdValue)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function AssetList({ portfolio }: { portfolio: PortfolioView }) {
  const { assets, isLoading } = portfolio;
  const hideZero = useSettingsStore((s) => s.hideZeroBalances);

  const visible = hideZero
    ? assets.filter((a) => a.amount > 0 || a.errored)
    : assets;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Assets</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/receive">Receive</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((asset) => (
              <AssetRow key={asset.chainId} asset={asset} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
