/**
 * High-level MeneseSDK client: turns raw canister responses into the app's
 * domain types (`ChainAddress`, raw balance maps). This is the single place
 * that knows the exact `.did` field names, so the rest of the app stays clean.
 */
import { getMeneseActor, getPrincipalText } from "./actor";
import { isOk } from "./types";
import type { ChainId } from "@/types/chain";
import { CHAIN_LIST } from "@/lib/chains/registry";

/** All addresses keyed by ChainId. EVM chains share one derived address. */
export async function fetchAllAddresses(): Promise<Record<ChainId, string>> {
  const actor = await getMeneseActor();
  const [a, principal] = await Promise.all([
    actor.getAllAddresses(),
    getPrincipalText(),
  ]);

  const evm = a.evm.evmAddress;
  return {
    ethereum: evm,
    arbitrum: evm,
    base: evm,
    polygon: evm,
    bsc: evm,
    optimism: evm,
    solana: a.solana.address,
    bitcoin: a.bitcoin.bech32Address,
    litecoin: a.litecoin.bech32Address,
    xrp: a.xrp.classicAddress,
    sui: a.sui.suiAddress,
    ton: a.ton.nonBounceable,
    cardano: a.cardano.bech32Address,
    tron: a.tron.base58Address,
    aptos: a.aptos.address,
    near: a.near.implicitAccountId,
    thorchain: a.thorchain.bech32Address,
    icp: principal ?? "",
  };
}

/**
 * Native balances available from the canister batch endpoint, in base units.
 * EVM chains are NOT here — they are fetched per-chain through the RPC service
 * (see `src/lib/rpc`). Chains that errored or aren't covered are omitted.
 */
export async function fetchCanisterBalances(): Promise<
  Partial<Record<ChainId, bigint>>
> {
  const actor = await getMeneseActor();
  const b = await actor.getAllBalances();

  const out: Partial<Record<ChainId, bigint>> = {};
  out.bitcoin = b.bitcoin;
  out.litecoin = b.litecoin;
  out.near = b.near;
  if (isOk(b.solana)) out.solana = b.solana.ok;
  if (isOk(b.icp)) out.icp = b.icp.ok;
  if (isOk(b.aptos)) out.aptos = b.aptos.ok;
  if (isOk(b.cardano)) out.cardano = b.cardano.ok;
  if (isOk(b.ton)) out.ton = b.ton.ok;
  if (isOk(b.xrp)) {
    // XRP balance comes back as a decimal string of XRP — convert to drops.
    const drops = Math.round(parseFloat(b.xrp.ok) * 1e6);
    if (!Number.isNaN(drops)) out.xrp = BigInt(drops);
  }
  // THORChain: sum the RUNE denom if present.
  const rune = b.thorchain.find((x) => x.denom.toLowerCase().includes("rune"));
  if (rune) out.thorchain = rune.amount;

  return out;
}

/** Quick health-check of the canister (used on the Settings page). */
export async function pingCanister(): Promise<{ health: string; version: string }> {
  const actor = await getMeneseActor();
  const [health, version] = await Promise.all([
    actor.health(),
    actor.version(),
  ]);
  return { health, version };
}

/** Chains we attempt to show a balance for (everything with a price + native unit). */
export const PRICED_CHAINS: ChainId[] = CHAIN_LIST.filter(
  (c) => c.coingeckoId,
).map((c) => c.id);
