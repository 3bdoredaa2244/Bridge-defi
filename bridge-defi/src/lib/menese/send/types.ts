import type { ChainMeta } from "@/types/chain";

/** Input to a send strategy, normalised for any chain. */
export interface SendContext {
  chain: ChainMeta;
  /** Sender's derived address on this chain. */
  from: string;
  /** Recipient address (already validated). */
  to: string;
  /** Amount in base units (wei/lamports/drops/mist). */
  amountBaseUnits: bigint;
  /** Amount in human display units (e.g. "0.5") — needed by XRP's relayer. */
  amountDisplay: string;
}

/** Result of a successful Sign-and-Broadcast send. */
export interface SendOutcome {
  /** On-chain transaction hash / signature / digest. */
  hash: string;
  /** Deep link to the transaction on a block explorer. */
  explorerUrl: string;
  /** Sender address as reported by the signer. */
  from: string;
}

/**
 * A strategy signs on the MeneseSDK canister and broadcasts via Bridge.defi's
 * own RPCs — i.e. Sign-and-Broadcast mode. No autonomous canister outcalls.
 */
export type SendStrategy = (ctx: SendContext) => Promise<SendOutcome>;
