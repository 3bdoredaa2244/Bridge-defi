"use client";

import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PortfolioView } from "./use-portfolio";

export function PortfolioSummary({ portfolio }: { portfolio: PortfolioView }) {
  const { totalUsd, isLoading, isFetching, hasErrors, refetch } = portfolio;
  const fundedCount = portfolio.assets.filter((a) => a.amount > 0).length;

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-grid-accent pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Total portfolio value
          </p>
          {isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <p className="text-4xl font-semibold tracking-tight">
              {formatUsd(totalUsd)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {fundedCount} funded {fundedCount === 1 ? "asset" : "assets"} across
            all chains
          </p>
        </div>

        <div className="relative flex items-center gap-2">
          {hasErrors && (
            <span
              className="flex items-center gap-1 text-xs text-warning"
              title="Some balances could not be fetched"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Partial data
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
