/**
 * SUI Sign-and-Broadcast strategy.
 *   1. Fetch a gas coin from our RPC
 *   2. Canister signs (signSuiTransferRelayer)
 *   3. Execute the signed tx block via our RPC
 */
import { getMeneseActor } from "@/lib/menese/actor";
import { getSuiGasCoin } from "@/lib/rpc/chain-data";
import { broadcastSui } from "@/lib/menese/broadcast";
import { resolveRpcUrl } from "@/store/settings-store";
import type { SendContext, SendOutcome } from "./types";

export async function sendSui(ctx: SendContext): Promise<SendOutcome> {
  const actor = await getMeneseActor();
  const rpc = resolveRpcUrl("sui");

  const coin = await getSuiGasCoin(ctx.from);

  const signed = await actor.signSuiTransferRelayer(
    ctx.to,
    ctx.amountBaseUnits,
    coin.coinObjectId,
    coin.version,
    coin.digest,
  );

  const digest = await broadcastSui(
    signed.txBytesBase64,
    signed.signatureBase64,
    rpc,
  );

  return {
    hash: digest,
    explorerUrl: `${ctx.chain.txExplorer}${digest}`,
    from: signed.senderAddress || ctx.from,
  };
}
