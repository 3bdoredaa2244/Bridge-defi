/**
 * MeneseSDK Candid interface — the subset Bridge.defi uses.
 *
 * Field names match the deployed `.did` exactly (e.g. `evmAddress`, not
 * `address`; `bech32Address` for BTC/LTC/THOR; `base58Address` for Tron).
 * Full interface: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=urs2a-ziaaa-aaaad-aembq-cai
 *
 * We deliberately include only the address, balance and Sign-and-Broadcast
 * (sign-only relayer) endpoints — Bridge.defi never asks the canister to make
 * HTTP outcalls; it signs on-canister and broadcasts from the browser.
 */

import type { IDL } from "@dfinity/candid";

// The IDL builder is injected by @dfinity/candid at call time (generated-code convention).
export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const Result = IDL.Variant({ ok: IDL.Text, err: IDL.Text });
  const ResultNat = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const ResultNat64 = IDL.Variant({ ok: IDL.Nat64, err: IDL.Text });

  // ─── Address records ──────────────────────────────────────────
  const SolanaAddressInfo = IDL.Record({
    address: IDL.Text,
    publicKeyHex: IDL.Text,
    publicKeyBytes: IDL.Vec(IDL.Nat8),
  });
  const EvmAddressInfo = IDL.Record({
    evmAddress: IDL.Text,
    publicKeyHex: IDL.Text,
  });
  const AddressInfo = IDL.Record({
    bech32Address: IDL.Text,
    hash160Hex: IDL.Text,
    pubKeyHex: IDL.Text,
  });
  const CardanoAddressInfo = IDL.Record({
    bech32Address: IDL.Text,
    addressBytesHex: IDL.Text,
    paymentPubKeyHex: IDL.Text,
    stakePubKeyHex: IDL.Text,
  });
  const SuiAddressInfo = IDL.Record({
    suiAddress: IDL.Text,
    publicKeyHex: IDL.Text,
    publicKeyBytes: IDL.Vec(IDL.Nat8),
  });
  const XrpAddressInfo = IDL.Record({
    classicAddress: IDL.Text,
    accountIdHex: IDL.Text,
    accountIdBytes: IDL.Vec(IDL.Nat8),
    publicKeyHex: IDL.Text,
  });
  const TonAddressInfo = IDL.Record({
    bounceable: IDL.Text,
    nonBounceable: IDL.Text,
    rawAddress: IDL.Text,
    publicKeyHex: IDL.Text,
    stateInitBocBase64: IDL.Text,
  });
  const TronAddressInfo = IDL.Record({
    base58Address: IDL.Text,
    hexAddress: IDL.Text,
    publicKeyHex: IDL.Text,
  });
  const AptosAddressInfo = IDL.Record({
    address: IDL.Text,
    publicKeyHex: IDL.Text,
  });
  const PubKeyInfo = IDL.Record({
    implicitAccountId: IDL.Text,
    publicKeyBase58: IDL.Text,
    publicKeyHex: IDL.Text,
  });

  return IDL.Service({
    // ─── Batch address + balance endpoints (FREE) ───────────────
    getAllAddresses: IDL.Func(
      [],
      [
        IDL.Record({
          aptos: AptosAddressInfo,
          bitcoin: AddressInfo,
          cardano: CardanoAddressInfo,
          evm: EvmAddressInfo,
          litecoin: AddressInfo,
          near: PubKeyInfo,
          solana: SolanaAddressInfo,
          sui: SuiAddressInfo,
          thorchain: AddressInfo,
          ton: TonAddressInfo,
          tron: TronAddressInfo,
          xrp: XrpAddressInfo,
        }),
      ],
      [],
    ),
    getAllBalances: IDL.Func(
      [],
      [
        IDL.Record({
          aptos: ResultNat64,
          bitcoin: IDL.Nat64,
          cardano: ResultNat64,
          icp: ResultNat64,
          litecoin: IDL.Nat64,
          near: IDL.Nat,
          solana: ResultNat64,
          thorchain: IDL.Vec(
            IDL.Record({ amount: IDL.Nat, denom: IDL.Text }),
          ),
          ton: ResultNat64,
          xrp: Result,
        }),
      ],
      [],
    ),

    // ─── Per-chain reads used to augment EVM balances ───────────
    getMyEvmAddress: IDL.Func([], [EvmAddressInfo], []),
    getMyEvmBalance: IDL.Func([IDL.Text], [ResultNat], []), // rpcEndpoint
    getMyXrpAddress: IDL.Func([], [XrpAddressInfo], []),
    getMySuiAddress: IDL.Func([], [SuiAddressInfo], []),
    getMySolanaAddress: IDL.Func([], [SolanaAddressInfo], []),

    // ─── Sign-and-Broadcast (sign-only relayer) endpoints ───────
    // The canister signs; Bridge.defi broadcasts via its own RPCs.

    // Solana: signSolTransferRelayer(to, lamports, blockhashBase58)
    signSolTransferRelayer: IDL.Func(
      [IDL.Text, IDL.Nat64, IDL.Text],
      [
        IDL.Record({
          signedTxBase64: IDL.Text,
          txMessage: IDL.Vec(IDL.Nat8),
          signature: IDL.Vec(IDL.Nat8),
          publicKey: IDL.Vec(IDL.Nat8),
        }),
      ],
      [],
    ),

    // EVM: buildAndSignEvmTxWithData(to, value, data, nonce, gasLimit, gasPrice, chainId)
    buildAndSignEvmTxWithData: IDL.Func(
      [
        IDL.Text,
        IDL.Nat,
        IDL.Vec(IDL.Nat8),
        IDL.Nat,
        IDL.Nat,
        IDL.Nat,
        IDL.Nat,
      ],
      [
        IDL.Record({
          rawTxHex_v0: IDL.Text,
          rawTxHex_v1: IDL.Text,
          txHash: IDL.Text,
          signature: IDL.Text,
        }),
      ],
      [],
    ),

    // XRP: signXrpTransferRelayer(dest, amountXrp, sequence, lastLedgerSeq, fee, destinationTag?)
    signXrpTransferRelayer: IDL.Func(
      [
        IDL.Text,
        IDL.Text,
        IDL.Nat32,
        IDL.Nat32,
        IDL.Nat64,
        IDL.Opt(IDL.Nat32),
      ],
      [
        IDL.Record({
          signedTxHex: IDL.Text,
          txHash: IDL.Text,
          senderAddress: IDL.Text,
          publicKeyHex: IDL.Text,
        }),
      ],
      [],
    ),

    // SUI: signSuiTransferRelayer(recipient, amount, gasCoinId, gasCoinVersion, gasCoinDigest)
    signSuiTransferRelayer: IDL.Func(
      [IDL.Text, IDL.Nat64, IDL.Text, IDL.Nat64, IDL.Text],
      [
        IDL.Record({
          txBytesBase64: IDL.Text,
          signatureBase64: IDL.Text,
          senderAddress: IDL.Text,
        }),
      ],
      [],
    ),

    // ─── Diagnostics ────────────────────────────────────────────
    health: IDL.Func([], [IDL.Text], ["query"]),
    version: IDL.Func([], [IDL.Text], ["query"]),
  });
};
