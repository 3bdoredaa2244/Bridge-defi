/**
 * Lightweight, dependency-free recipient-address validation per chain family.
 *
 * These are format/heuristic checks — enough to catch typos and wrong-chain
 * pastes before signing. They intentionally do not verify checksums for every
 * chain (the canister/RPC will reject a truly invalid address at sign time).
 */
import type { ChainKind } from "@/types/chain";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const ok: ValidationResult = { valid: true };
const fail = (message: string): ValidationResult => ({ valid: false, message });

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function validateRecipient(
  kind: ChainKind,
  address: string,
): ValidationResult {
  const a = address.trim();
  if (!a) return fail("Recipient address is required");

  switch (kind) {
    case "evm":
      return /^0x[0-9a-fA-F]{40}$/.test(a)
        ? ok
        : fail("Expected a 0x-prefixed 40-character hex address");

    case "solana":
      return BASE58_RE.test(a) && a.length >= 32 && a.length <= 44
        ? ok
        : fail("Expected a base58 Solana address (32–44 chars)");

    case "xrp":
      return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(a)
        ? ok
        : fail("Expected an XRP classic address starting with 'r'");

    case "sui":
    case "aptos":
      return /^0x[0-9a-fA-F]{1,64}$/.test(a)
        ? ok
        : fail("Expected a 0x-prefixed hex address");

    case "bitcoin":
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,87}$/.test(a)
        ? ok
        : fail("Expected a valid Bitcoin address");

    case "litecoin":
      return /^(ltc1|[LM3])[a-zA-HJ-NP-Z0-9]{20,87}$/.test(a)
        ? ok
        : fail("Expected a valid Litecoin address");

    case "tron":
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)
        ? ok
        : fail("Expected a Tron base58 address starting with 'T'");

    case "ton":
      return a.length >= 48
        ? ok
        : fail("Expected a TON address");

    case "cardano":
      return /^addr1[0-9a-z]+$/.test(a)
        ? ok
        : fail("Expected a Cardano bech32 address (addr1…)");

    case "near":
      return a.length >= 2
        ? ok
        : fail("Expected a NEAR account id");

    case "thorchain":
      return /^thor1[0-9a-z]+$/.test(a)
        ? ok
        : fail("Expected a THORChain address (thor1…)");

    default:
      // Unknown family: accept non-empty and let the signer validate.
      return ok;
  }
}

export interface AmountValidationInput {
  raw: string;
  /** Max spendable in display units (balance minus fee buffer). */
  available?: number;
}

export function validateAmount(input: AmountValidationInput): ValidationResult {
  const { raw, available } = input;
  if (!raw.trim()) return fail("Amount is required");
  if (!/^\d*\.?\d*$/.test(raw)) return fail("Amount must be a number");
  const value = Number(raw);
  if (Number.isNaN(value)) return fail("Amount must be a number");
  if (value <= 0) return fail("Amount must be greater than zero");
  if (available !== undefined && value > available) {
    return fail("Amount exceeds available balance");
  }
  return ok;
}
