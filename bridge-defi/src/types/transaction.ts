import type { ChainId } from "./chain";

export type TxStatus = "pending" | "confirmed" | "failed";

export type TxDirection = "send" | "receive";

/**
 * A transaction record persisted locally (per Internet Identity principal).
 * Bridge.defi records every send it broadcasts so history survives reloads.
 */
export interface TxRecord {
  /** Stable local id (also used as React key). */
  id: string;
  /** Owning principal (records are scoped per logged-in identity). */
  principal: string;
  chainId: ChainId;
  direction: TxDirection;
  status: TxStatus;
  /** On-chain transaction hash / signature, once known. */
  hash?: string;
  from: string;
  to: string;
  /** Display amount as a string (e.g. "0.0125"). */
  amount: string;
  symbol: string;
  /** Optional fee in display units. */
  fee?: string;
  /** Unix epoch milliseconds. */
  createdAt: number;
  updatedAt: number;
  /** Explorer deep link to the transaction, when available. */
  explorerUrl?: string;
  /** Human-readable error, when status === "failed". */
  error?: string;
}
