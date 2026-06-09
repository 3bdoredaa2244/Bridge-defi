/**
 * USD price service. Fetches spot prices for the native assets we track from
 * a CoinGecko-compatible endpoint. Used to value the portfolio; failures are
 * non-fatal (balances still render, USD shows as "—").
 */
import { env } from "@/config/env";
import { CHAIN_LIST } from "@/lib/chains/registry";

export type PriceMap = Record<string, number>;

/** Unique CoinGecko ids across all priced chains. */
function coingeckoIds(): string[] {
  const ids = new Set<string>();
  for (const c of CHAIN_LIST) {
    if (c.coingeckoId) ids.add(c.coingeckoId);
  }
  return [...ids];
}

/**
 * Returns a map of coingeckoId → USD price. Throws on network error so React
 * Query can surface a retry; the dashboard treats missing prices gracefully.
 */
export async function fetchPrices(): Promise<PriceMap> {
  const ids = coingeckoIds();
  if (ids.length === 0) return {};

  const url = `${env.priceApiBase}/simple/price?ids=${ids.join(
    ",",
  )}&vs_currencies=usd`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Price API HTTP ${res.status}`);
  }
  const json = (await res.json()) as Record<string, { usd: number }>;

  const out: PriceMap = {};
  for (const [id, value] of Object.entries(json)) {
    if (typeof value?.usd === "number") out[id] = value.usd;
  }
  return out;
}
