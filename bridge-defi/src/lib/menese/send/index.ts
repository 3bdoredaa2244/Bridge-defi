/**
 * Send dispatcher — routes a send request to the right Sign-and-Broadcast
 * strategy based on the chain's signing family. Adding a new chain is a
 * matter of writing its strategy and registering it here.
 */
import type { ChainKind } from "@/types/chain";
import type { SendContext, SendOutcome, SendStrategy } from "./types";
import { sendEvm } from "./evm";
import { sendSolana } from "./solana";
import { sendXrp } from "./xrp";
import { sendSui } from "./sui";

const STRATEGIES: Partial<Record<ChainKind, SendStrategy>> = {
  evm: sendEvm,
  solana: sendSolana,
  xrp: sendXrp,
  sui: sendSui,
};

export class UnsupportedSendError extends Error {
  constructor(kind: ChainKind) {
    super(`Sending from ${kind} chains is not yet enabled in Bridge.defi.`);
    this.name = "UnsupportedSendError";
  }
}

/** Execute a Sign-and-Broadcast send for any supported chain. */
export async function executeSend(ctx: SendContext): Promise<SendOutcome> {
  const strategy = STRATEGIES[ctx.chain.kind];
  if (!strategy) {
    throw new UnsupportedSendError(ctx.chain.kind);
  }
  return strategy(ctx);
}

export type { SendContext, SendOutcome } from "./types";
