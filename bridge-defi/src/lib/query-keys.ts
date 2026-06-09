/** Centralised React Query key factory — scoped per principal where relevant. */
export const queryKeys = {
  addresses: (principal: string | null) => ["addresses", principal] as const,
  balances: (principal: string | null) => ["balances", principal] as const,
  prices: () => ["prices"] as const,
  canisterHealth: () => ["canister-health"] as const,
};
