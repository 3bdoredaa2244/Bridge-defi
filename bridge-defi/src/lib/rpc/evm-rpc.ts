/**
 * Configurable EVM RPC service.
 *
 * Supports the six chains Bridge.defi sends on — Ethereum, Arbitrum, Base,
 * Polygon, BSC, Optimism — through one uniform API. Endpoints are resolved
 * from the settings store (user override → env default), so the same code
 * path serves every chain; only the URL and chain id differ.
 *
 * Responsibilities:
 *   - read native balance (eth_getBalance)
 *   - read nonce + gas price needed to build a Sign-and-Broadcast tx
 *   - broadcast a signed raw transaction (delegated to lib/menese/broadcast)
 */
import { jsonRpc } from "./json-rpc";
import { broadcastEvm } from "@/lib/menese/broadcast";
import { resolveRpcUrl } from "@/store/settings-store";
import { getChain, isEvmChain } from "@/lib/chains/registry";
import type { ChainId } from "@/types/chain";

export interface EvmFeeData {
  nonce: bigint;
  gasPrice: bigint;
  gasLimit: bigint;
}

/** A standard native-token transfer costs 21,000 gas. */
const NATIVE_TRANSFER_GAS = 21_000n;

function rpcFor(chainId: ChainId): string {
  if (!isEvmChain(chainId)) {
    throw new Error(`${chainId} is not an EVM chain`);
  }
  return resolveRpcUrl(chainId);
}

/** Native balance in wei. */
export async function getEvmBalance(
  chainId: ChainId,
  address: string,
): Promise<bigint> {
  const hex = await jsonRpc<string>(rpcFor(chainId), "eth_getBalance", [
    address,
    "latest",
  ]);
  return BigInt(hex);
}

/** Outstanding nonce for the next transaction (pending count). */
export async function getNonce(
  chainId: ChainId,
  address: string,
): Promise<bigint> {
  const hex = await jsonRpc<string>(rpcFor(chainId), "eth_getTransactionCount", [
    address,
    "pending",
  ]);
  return BigInt(hex);
}

/** Current gas price in wei. */
export async function getGasPrice(chainId: ChainId): Promise<bigint> {
  const hex = await jsonRpc<string>(rpcFor(chainId), "eth_gasPrice", []);
  return BigInt(hex);
}

/**
 * Everything needed to build a native transfer: nonce, gas price, gas limit.
 * Fetched in parallel against the configured RPC.
 */
export async function getFeeData(
  chainId: ChainId,
  address: string,
): Promise<EvmFeeData> {
  const [nonce, gasPrice] = await Promise.all([
    getNonce(chainId, address),
    getGasPrice(chainId),
  ]);
  return { nonce, gasPrice, gasLimit: NATIVE_TRANSFER_GAS };
}

/** Estimated network fee for a native transfer in wei (gasLimit × gasPrice). */
export function estimateNativeFee(fee: EvmFeeData): bigint {
  return fee.gasLimit * fee.gasPrice;
}

/** Broadcast a signed raw transaction for the given EVM chain. Returns tx hash. */
export async function broadcastEvmTx(
  chainId: ChainId,
  signedTxHex: string,
): Promise<string> {
  return broadcastEvm(signedTxHex, rpcFor(chainId));
}

/** The numeric EVM chain id (e.g. 1, 42161). */
export function evmChainId(chainId: ChainId): bigint {
  const meta = getChain(chainId);
  if (meta.evmChainId === undefined) {
    throw new Error(`${chainId} has no EVM chain id`);
  }
  return BigInt(meta.evmChainId);
}
