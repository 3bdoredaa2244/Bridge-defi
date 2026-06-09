"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRawBalances } from "./fetch-balances";
import { usePrices } from "./use-prices";
import { useAddresses } from "@/features/receive/use-addresses";
import { useAuth } from "@/features/auth/use-auth";
import { queryKeys } from "@/lib/query-keys";
import { CHAIN_LIST } from "@/lib/chains/registry";
import { fromBaseUnits } from "@/lib/format";
import type { ChainBalance, ChainId } from "@/types";

export interface PortfolioView {
  assets: ChainBalance[];
  totalUsd: number;
  /** True when at least one chain's balance could not be fetched. */
  hasErrors: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

/**
 * The portfolio: merges raw balances (canister + EVM RPC) with USD prices into
 * a sorted asset list and a total. Balances refetch on demand and on a slow
 * interval; prices refresh independently.
 */
export function usePortfolio(): PortfolioView {
  const { principal, isConnected } = useAuth();
  const addressesQuery = useAddresses();
  const pricesQuery = usePrices();

  const balancesQuery = useQuery({
    queryKey: queryKeys.balances(principal),
    queryFn: () => fetchRawBalances(addressesQuery.data!),
    enabled: isConnected && !!addressesQuery.data,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  const view = useMemo<Omit<PortfolioView, "refetch">>(() => {
    const raw = balancesQuery.data?.balances ?? {};
    const erroredSet = new Set<ChainId>(balancesQuery.data?.errored ?? []);
    const prices = pricesQuery.data ?? {};

    const assets: ChainBalance[] = CHAIN_LIST.map((chain) => {
      const rawValue = raw[chain.id];
      const amount =
        rawValue !== undefined ? fromBaseUnits(rawValue, chain.decimals) : 0;
      const price = chain.coingeckoId ? prices[chain.coingeckoId] : undefined;
      const usdValue = price !== undefined ? amount * price : null;
      return {
        chainId: chain.id,
        raw: rawValue ?? 0n,
        amount,
        usdValue,
        errored: erroredSet.has(chain.id),
      };
    });

    // Sort: highest USD value first, then by token amount.
    assets.sort((a, b) => {
      const av = a.usdValue ?? -1;
      const bv = b.usdValue ?? -1;
      if (bv !== av) return bv - av;
      return b.amount - a.amount;
    });

    const totalUsd = assets.reduce((sum, a) => sum + (a.usdValue ?? 0), 0);

    return {
      assets,
      totalUsd,
      hasErrors: erroredSet.size > 0,
      isLoading:
        addressesQuery.isLoading || balancesQuery.isLoading,
      isFetching: balancesQuery.isFetching || pricesQuery.isFetching,
    };
  }, [
    addressesQuery.isLoading,
    balancesQuery.data,
    balancesQuery.isFetching,
    balancesQuery.isLoading,
    pricesQuery.data,
    pricesQuery.isFetching,
  ]);

  return {
    ...view,
    refetch: () => {
      void balancesQuery.refetch();
      void pricesQuery.refetch();
    },
  };
}
