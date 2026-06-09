"use client";

import { ArrowUpRight, ExternalLink, ListOrdered } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "./status-badge";
import { ChainIcon } from "@/components/common/chain-icon";
import { useTransactions } from "./use-transactions";
import { CHAINS } from "@/lib/chains/registry";
import { shortenAddress, timeAgo } from "@/lib/format";
import type { TxRecord } from "@/types/transaction";

function TxItem({ tx }: { tx: TxRecord }) {
  const chain = CHAINS[tx.chainId];
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative">
          <ChainIcon chain={chain} size="md" />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background">
            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            Sent {tx.amount} {tx.symbol}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            To {shortenAddress(tx.to, 6, 4)} · {timeAgo(tx.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={tx.status} />
        {tx.explorerUrl && (
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

interface TxListProps {
  /** Limit the number of rows (e.g. the dashboard preview). */
  limit?: number;
  title?: string;
}

export function TxList({ limit, title = "Transaction history" }: TxListProps) {
  const { records } = useTransactions();
  const shown = limit ? records.slice(0, limit) : records;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <EmptyState
            icon={ListOrdered}
            title="No transactions yet"
            description="Once you send assets, every transaction will appear here with its live status."
          />
        ) : (
          <div className="divide-y divide-border">
            {shown.map((tx) => (
              <TxItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
