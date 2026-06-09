"use client";

import { useQuery } from "@tanstack/react-query";
import { pingCanister } from "@/lib/menese/client";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/features/auth/use-auth";

/** Canister health + version, shown on the Settings page. */
export function useCanisterHealth() {
  const { isConnected } = useAuth();
  return useQuery({
    queryKey: queryKeys.canisterHealth(),
    queryFn: pingCanister,
    enabled: isConnected,
    staleTime: 1000 * 60,
    retry: 1,
  });
}
