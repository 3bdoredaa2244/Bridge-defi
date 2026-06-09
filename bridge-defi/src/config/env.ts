/**
 * Centralised, type-safe access to public runtime configuration.
 *
 * Everything here is `NEXT_PUBLIC_*` because Bridge.defi runs entirely
 * client-side: the user authenticates with Internet Identity and private
 * keys are derived/held inside the MeneseSDK canister — never in this app.
 */

function readEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  meneseCanisterId: readEnv(
    "NEXT_PUBLIC_MENESE_CANISTER_ID",
    "urs2a-ziaaa-aaaad-aembq-cai",
  ),
  icHost: readEnv("NEXT_PUBLIC_IC_HOST", "https://icp0.io"),
  iiProvider: readEnv("NEXT_PUBLIC_II_PROVIDER", "https://identity.ic0.app"),
  priceApiBase: readEnv(
    "NEXT_PUBLIC_PRICE_API_BASE",
    "https://api.coingecko.com/api/v3",
  ),
} as const;

/**
 * Default RPC endpoints, overridable per-chain via env and at runtime via the
 * settings store. Public endpoints are fine for reads; supply private
 * providers for production broadcasts.
 */
export const defaultRpcEndpoints: Record<string, string> = {
  ethereum: readEnv("NEXT_PUBLIC_RPC_ETHEREUM", "https://eth.llamarpc.com"),
  arbitrum: readEnv("NEXT_PUBLIC_RPC_ARBITRUM", "https://arb1.arbitrum.io/rpc"),
  base: readEnv("NEXT_PUBLIC_RPC_BASE", "https://mainnet.base.org"),
  polygon: readEnv("NEXT_PUBLIC_RPC_POLYGON", "https://polygon-rpc.com"),
  bsc: readEnv("NEXT_PUBLIC_RPC_BSC", "https://bsc-dataseed.binance.org"),
  optimism: readEnv("NEXT_PUBLIC_RPC_OPTIMISM", "https://mainnet.optimism.io"),
  solana: readEnv(
    "NEXT_PUBLIC_RPC_SOLANA",
    "https://api.mainnet-beta.solana.com",
  ),
  xrp: readEnv("NEXT_PUBLIC_RPC_XRP", "https://s1.ripple.com:51234"),
  sui: readEnv("NEXT_PUBLIC_RPC_SUI", "https://fullnode.mainnet.sui.io"),
};
