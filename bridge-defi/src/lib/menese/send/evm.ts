/**
 * EVM Sign-and-Broadcast strategy (Ethereum, Arbitrum, Base, Polygon, BSC, OP).
 *
 *   1. Read nonce + gas price from our own RPC (lib/rpc/evm-rpc)
 *   2. Canister signs the legacy/EIP-1559 tx (buildAndSignEvmTxWithData)
 *   3. Broadcast the raw tx via our own RPC
 */
import { getMeneseActor } from "@/lib/menese/actor";
import {
  getFeeData,
  broadcastEvmTx,
  evmChainId,
} from "@/lib/rpc/evm-rpc";
import type { SendContext, SendOutcome } from "./types";

export async function sendEvm(ctx: SendContext): Promise<SendOutcome> {
  const actor = await getMeneseActor();

  // 1. Chain data via our own RPC.
  const fee = await getFeeData(ctx.chain.id, ctx.from);

  // 2. Sign on the canister (1 action). Empty data ⇒ simple native transfer.
  const signed = await actor.buildAndSignEvmTxWithData(
    ctx.to,
    ctx.amountBaseUnits,
    [],
    fee.nonce,
    fee.gasLimit,
    fee.gasPrice,
    evmChainId(ctx.chain.id),
  );

  // 3. Broadcast the EIP-1559-compatible raw tx via our own RPC.
  const hash = await broadcastEvmTx(ctx.chain.id, signed.rawTxHex_v1);

  return {
    hash,
    explorerUrl: `${ctx.chain.txExplorer}${hash}`,
    from: ctx.from,
  };
}
