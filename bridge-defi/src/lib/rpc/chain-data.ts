/**
 * Pre-sign chain data fetchers for non-EVM Sign-and-Broadcast flows.
 *
 * Each function pulls the fresh chain state the canister needs to produce a
 * valid signature (recent blockhash, account sequence, gas coin, …) using the
 * app's own RPC endpoints — keeping the canister free of HTTP outcalls.
 */
import { jsonRpc, RpcRequestError } from "./json-rpc";
import { resolveRpcUrl } from "@/store/settings-store";

// ─── Solana ─────────────────────────────────────────────────────
export async function getSolanaBlockhash(): Promise<string> {
  const rpc = resolveRpcUrl("solana");
  const result = await jsonRpc<{ value: { blockhash: string } }>(
    rpc,
    "getLatestBlockhash",
    [{ commitment: "finalized" }],
  );
  return result.value.blockhash;
}

export async function getSolanaBalance(address: string): Promise<bigint> {
  const rpc = resolveRpcUrl("solana");
  const result = await jsonRpc<{ value: number }>(rpc, "getBalance", [address]);
  return BigInt(result.value);
}

// ─── XRP ────────────────────────────────────────────────────────
export interface XrpAccountData {
  sequence: number;
  lastLedgerSeq: number;
}

export async function getXrpAccountData(
  address: string,
): Promise<XrpAccountData> {
  const rpc = resolveRpcUrl("xrp");
  const [acct, ledger] = await Promise.all([
    jsonRpc<{ account_data: { Sequence: number } }>(rpc, "account_info", [
      { account: address, ledger_index: "current" },
    ]),
    jsonRpc<{ ledger_current_index: number }>(rpc, "ledger_current", [{}]),
  ]);
  return {
    sequence: acct.account_data.Sequence,
    // Valid for ~20 ledgers (~80s) — guards against a stuck broadcast.
    lastLedgerSeq: ledger.ledger_current_index + 20,
  };
}

// ─── SUI ────────────────────────────────────────────────────────
export interface SuiGasCoin {
  coinObjectId: string;
  version: bigint;
  digest: string;
}

export async function getSuiGasCoin(address: string): Promise<SuiGasCoin> {
  const rpc = resolveRpcUrl("sui");
  const result = await jsonRpc<{
    data: Array<{ coinObjectId: string; version: string; digest: string }>;
  }>(rpc, "suix_getCoins", [address, "0x2::sui::SUI", null, 1]);

  const coin = result.data[0];
  if (!coin) {
    throw new RpcRequestError(
      "No SUI gas coin available for this address",
      rpc,
      "suix_getCoins",
    );
  }
  return {
    coinObjectId: coin.coinObjectId,
    version: BigInt(coin.version),
    digest: coin.digest,
  };
}
