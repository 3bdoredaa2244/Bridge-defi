/**
 * XRP Sign-and-Broadcast strategy.
 *   1. Fetch account sequence + current ledger from our RPC
 *   2. Canister signs (signXrpTransferRelayer) — amount is XRP, not drops
 *   3. Submit the signed blob via our RPC
 */
import { getMeneseActor } from "@/lib/menese/actor";
import { getXrpAccountData } from "@/lib/rpc/chain-data";
import { broadcastXrp } from "@/lib/menese/broadcast";
import { resolveRpcUrl } from "@/store/settings-store";
import type { SendContext, SendOutcome } from "./types";

/** Standard XRP network fee: 12 drops. */
const XRP_FEE_DROPS = 12n;

export async function sendXrp(ctx: SendContext): Promise<SendOutcome> {
  const actor = await getMeneseActor();
  const rpc = resolveRpcUrl("xrp");

  const { sequence, lastLedgerSeq } = await getXrpAccountData(ctx.from);

  const signed = await actor.signXrpTransferRelayer(
    ctx.to,
    ctx.amountDisplay, // XRP units (e.g. "10.5")
    sequence,
    lastLedgerSeq,
    XRP_FEE_DROPS,
    [], // no destination tag
  );

  const hash = await broadcastXrp(signed.signedTxHex, signed.txHash, rpc);

  return {
    hash,
    explorerUrl: `${ctx.chain.txExplorer}${hash}`,
    from: signed.senderAddress || ctx.from,
  };
}
