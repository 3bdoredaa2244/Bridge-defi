/**
 * Solana Sign-and-Broadcast strategy.
 *   1. Fetch a fresh blockhash from our RPC
 *   2. Canister signs (signSolTransferRelayer)
 *   3. Broadcast the signed tx via our RPC
 */
import { getMeneseActor } from "@/lib/menese/actor";
import { getSolanaBlockhash } from "@/lib/rpc/chain-data";
import { broadcastSolana } from "@/lib/menese/broadcast";
import { resolveRpcUrl } from "@/store/settings-store";
import type { SendContext, SendOutcome } from "./types";

export async function sendSolana(ctx: SendContext): Promise<SendOutcome> {
  const actor = await getMeneseActor();
  const rpc = resolveRpcUrl("solana");

  const blockhash = await getSolanaBlockhash();

  const signed = await actor.signSolTransferRelayer(
    ctx.to,
    ctx.amountBaseUnits,
    blockhash,
  );

  const signature = await broadcastSolana(signed.signedTxBase64, rpc);

  return {
    hash: signature,
    explorerUrl: `${ctx.chain.txExplorer}${signature}`,
    from: ctx.from,
  };
}
