/**
 * Assembles raw native balances across every chain:
 *   - non-EVM chains come from the MeneseSDK batch endpoint (getAllBalances)
 *   - EVM chains are read per-chain through the configurable RPC service
 *
 * Each EVM read is independent and failure-isolated so one dead RPC doesn't
 * blank the whole portfolio.
 */
import { fetchCanisterBalances } from "@/lib/menese/client";
import { getEvmBalance } from "@/lib/rpc/evm-rpc";
import { EVM_CHAINS } from "@/lib/chains/registry";
import type { ChainId } from "@/types/chain";

export interface RawBalances {
  /** Base-unit balances by chain. Missing key ⇒ unknown. */
  balances: Partial<Record<ChainId, bigint>>;
  /** Chains whose balance fetch failed (shown as "error" in the UI). */
  errored: ChainId[];
}

export async function fetchRawBalances(
  addresses: Record<ChainId, string>,
): Promise<RawBalances> {
  const errored: ChainId[] = [];

  // Kick off both sources in parallel.
  const canisterPromise = fetchCanisterBalances().catch((err) => {
    console.error("[balances] canister batch failed:", err);
    return {} as Partial<Record<ChainId, bigint>>;
  });

  const evmPromise = Promise.all(
    EVM_CHAINS.map(async (chain) => {
      const address = addresses[chain.id];
      if (!address) return [chain.id, null] as const;
      try {
        const raw = await getEvmBalance(chain.id, address);
        return [chain.id, raw] as const;
      } catch (err) {
        console.error(`[balances] ${chain.id} RPC failed:`, err);
        errored.push(chain.id);
        return [chain.id, null] as const;
      }
    }),
  );

  const [canister, evmResults] = await Promise.all([
    canisterPromise,
    evmPromise,
  ]);

  const balances: Partial<Record<ChainId, bigint>> = { ...canister };
  for (const [chainId, raw] of evmResults) {
    if (raw !== null) balances[chainId] = raw;
  }

  return { balances, errored };
}
