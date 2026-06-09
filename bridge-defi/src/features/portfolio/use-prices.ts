"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPrices } from "@/lib/prices";
import { queryKeys } from "@/lib/query-keys";

/** Spot USD prices for tracked assets. Refreshed every couple of minutes. */
export function usePrices() {
  return useQuery({
    queryKey: queryKeys.prices(),
    queryFn: fetchPrices,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
    retry: 1,
  });
}
