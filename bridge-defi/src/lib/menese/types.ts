/**
 * TypeScript shapes for the MeneseSDK actor methods Bridge.defi calls.
 * These mirror the records declared in `idl.ts`. Candid `Nat`/`Nat64` decode
 * to `bigint`; `Opt` decodes to a single-element array or empty array.
 */
import type { ActorSubclass } from "@dfinity/agent";

export type Result<T = string> = { ok: T } | { err: string };

export interface SolanaAddressInfo {
  address: string;
  publicKeyHex: string;
  publicKeyBytes: Uint8Array | number[];
}
export interface EvmAddressInfo {
  evmAddress: string;
  publicKeyHex: string;
}
export interface AddressInfo {
  bech32Address: string;
  hash160Hex: string;
  pubKeyHex: string;
}
export interface CardanoAddressInfo {
  bech32Address: string;
  addressBytesHex: string;
  paymentPubKeyHex: string;
  stakePubKeyHex: string;
}
export interface SuiAddressInfo {
  suiAddress: string;
  publicKeyHex: string;
  publicKeyBytes: Uint8Array | number[];
}
export interface XrpAddressInfo {
  classicAddress: string;
  accountIdHex: string;
  accountIdBytes: Uint8Array | number[];
  publicKeyHex: string;
}
export interface TonAddressInfo {
  bounceable: string;
  nonBounceable: string;
  rawAddress: string;
  publicKeyHex: string;
  stateInitBocBase64: string;
}
export interface TronAddressInfo {
  base58Address: string;
  hexAddress: string;
  publicKeyHex: string;
}
export interface AptosAddressInfo {
  address: string;
  publicKeyHex: string;
}
export interface PubKeyInfo {
  implicitAccountId: string;
  publicKeyBase58: string;
  publicKeyHex: string;
}

export interface AllAddresses {
  aptos: AptosAddressInfo;
  bitcoin: AddressInfo;
  cardano: CardanoAddressInfo;
  evm: EvmAddressInfo;
  litecoin: AddressInfo;
  near: PubKeyInfo;
  solana: SolanaAddressInfo;
  sui: SuiAddressInfo;
  thorchain: AddressInfo;
  ton: TonAddressInfo;
  tron: TronAddressInfo;
  xrp: XrpAddressInfo;
}

export interface AllBalances {
  aptos: Result<bigint>;
  bitcoin: bigint;
  cardano: Result<bigint>;
  icp: Result<bigint>;
  litecoin: bigint;
  near: bigint;
  solana: Result<bigint>;
  thorchain: Array<{ amount: bigint; denom: string }>;
  ton: Result<bigint>;
  xrp: Result<string>;
}

export interface SignedSolTx {
  signedTxBase64: string;
  txMessage: Uint8Array | number[];
  signature: Uint8Array | number[];
  publicKey: Uint8Array | number[];
}
export interface SignedEvmTx {
  rawTxHex_v0: string;
  rawTxHex_v1: string;
  txHash: string;
  signature: string;
}
export interface SignedXrpTx {
  signedTxHex: string;
  txHash: string;
  senderAddress: string;
  publicKeyHex: string;
}
export interface SignedSuiTx {
  txBytesBase64: string;
  signatureBase64: string;
  senderAddress: string;
}

/** The strongly-typed MeneseSDK service. */
export interface MeneseService {
  getAllAddresses(): Promise<AllAddresses>;
  getAllBalances(): Promise<AllBalances>;
  getMyEvmAddress(): Promise<EvmAddressInfo>;
  getMyEvmBalance(rpcEndpoint: string): Promise<Result<bigint>>;
  getMyXrpAddress(): Promise<XrpAddressInfo>;
  getMySuiAddress(): Promise<SuiAddressInfo>;
  getMySolanaAddress(): Promise<SolanaAddressInfo>;

  signSolTransferRelayer(
    to: string,
    lamports: bigint,
    blockhashBase58: string,
  ): Promise<SignedSolTx>;

  buildAndSignEvmTxWithData(
    to: string,
    value: bigint,
    data: Uint8Array | number[],
    nonce: bigint,
    gasLimit: bigint,
    gasPrice: bigint,
    chainId: bigint,
  ): Promise<SignedEvmTx>;

  signXrpTransferRelayer(
    dest: string,
    amountXrp: string,
    sequence: number,
    lastLedgerSeq: number,
    fee: bigint,
    destinationTag: [] | [number],
  ): Promise<SignedXrpTx>;

  signSuiTransferRelayer(
    recipient: string,
    amount: bigint,
    gasCoinId: string,
    gasCoinVersion: bigint,
    gasCoinDigest: string,
  ): Promise<SignedSuiTx>;

  health(): Promise<string>;
  version(): Promise<string>;
}

export type MeneseActor = ActorSubclass<MeneseService>;

/** Narrow a Candid Result variant. */
export function isOk<T>(r: Result<T>): r is { ok: T } {
  return "ok" in r;
}
