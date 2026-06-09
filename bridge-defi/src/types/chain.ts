/**
 * Chain identity and metadata types.
 *
 * `ChainId` is the canonical key used across the app (routing, RPC config,
 * balance maps, transaction records). EVM chains share a single derived
 * address but each has its own `evmChainId` and RPC endpoint.
 */

export type ChainId =
  | "ethereum"
  | "arbitrum"
  | "base"
  | "polygon"
  | "bsc"
  | "optimism"
  | "solana"
  | "bitcoin"
  | "litecoin"
  | "xrp"
  | "sui"
  | "ton"
  | "cardano"
  | "tron"
  | "aptos"
  | "near"
  | "thorchain"
  | "icp";

/** The signing/broadcast family a chain belongs to. */
export type ChainKind =
  | "evm"
  | "solana"
  | "xrp"
  | "sui"
  | "ton"
  | "cardano"
  | "tron"
  | "aptos"
  | "near"
  | "bitcoin"
  | "litecoin"
  | "thorchain"
  | "icp";

export interface ChainMeta {
  id: ChainId;
  /** Human-friendly name shown in the UI. */
  name: string;
  /** Native asset ticker. */
  symbol: string;
  /** Native asset decimals (used to convert base units ⇄ display units). */
  decimals: number;
  /** Signing family — determines which MeneseSDK relayer/broadcaster to use. */
  kind: ChainKind;
  /** EVM numeric chain id, when applicable. */
  evmChainId?: number;
  /** Block explorer base for an address (append the address). */
  addressExplorer: string;
  /** Block explorer base for a transaction (append the tx hash). */
  txExplorer: string;
  /** Short two-letter token used by the fallback chain badge. */
  badge: string;
  /** Tailwind classes for the chain accent (used by ChainIcon). */
  accent: string;
  /** CoinGecko id for USD pricing (omitted when not priced). */
  coingeckoId?: string;
  /**
   * Whether Bridge.defi can currently send from this chain using the
   * Sign-and-Broadcast flow. Receive (address display) works for every chain.
   */
  sendSupported: boolean;
}
