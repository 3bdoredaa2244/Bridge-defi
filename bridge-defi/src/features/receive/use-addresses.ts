"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllAddresses } from "@/lib/menese/client";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/features/auth/use-auth";
import type { ChainId } from "@/types/chain";

/**
 * Fetches the derived address for every chain via `getAllAddresses()`.
 * Addresses are deterministic per identity, so we cache them aggressively.
 */
export function useAddresses() {
  const { principal, isConnected } = useAuth();

  return useQuery({
    queryKey: queryKeys.addresses(principal),
    queryFn: fetchAllAddresses,
    enabled: isConnected,
    staleTime: 1000 * 60 * 60, // 1h — addresses don't change
    gcTime: 1000 * 60 * 60 * 24,
  });
}

/** Convenience selector for a single chain's address. */
export function useChainAddress(chainId: ChainId): string | undefined {
  const { data } = useAddresses();
  return data?.[chainId];
}
