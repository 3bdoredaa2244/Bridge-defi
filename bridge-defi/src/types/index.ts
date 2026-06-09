export type { ChainId, ChainKind, ChainMeta } from "./chain";
export type { TxRecord, TxStatus, TxDirection } from "./transaction";

import type { ChainId } from "./chain";

/** A resolved address for a single chain. */
export interface ChainAddress {
  chainId: ChainId;
  address: string;
}

/** A resolved native balance for a single chain. */
export interface ChainBalance {
  chainId: ChainId;
  /** Balance in base units (lamports, wei, satoshis, …) as bigint. */
  raw: bigint;
  /** Balance in display units (already divided by decimals). */
  amount: number;
  /** USD value, when a price is known. */
  usdValue: number | null;
  /** True when the balance could not be fetched (RPC/canister error). */
  errored: boolean;
}
