/**
 * Formatting & base-unit conversion helpers.
 *
 * Chains use integer base units (wei, lamports, satoshis, drops, …). We convert
 * to/from human display strings without floating-point error by operating on
 * bigint where it matters (parsing user input → base units).
 */

/** Convert a base-unit bigint to a JS number in display units. */
export function fromBaseUnits(raw: bigint, decimals: number): number {
  if (decimals === 0) return Number(raw);
  // Split into integer and fractional parts to preserve precision for display.
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  const value = Number(whole) + Number(frac) / Number(base);
  return negative ? -value : value;
}

/**
 * Parse a user-entered decimal string into a base-unit bigint.
 * Throws on malformed input or more fractional digits than `decimals`.
 */
export function toBaseUnits(input: string, decimals: number): bigint {
  const trimmed = input.trim();
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === "" || trimmed === ".") {
    throw new Error("Invalid amount");
  }
  const [wholePart = "0", fracPart = ""] = trimmed.split(".");
  if (fracPart.length > decimals) {
    throw new Error(`Too many decimals (max ${decimals})`);
  }
  const paddedFrac = fracPart.padEnd(decimals, "0");
  const combined = `${wholePart}${paddedFrac}`.replace(/^0+(?=\d)/, "");
  return BigInt(combined === "" ? "0" : combined);
}

/** Format a number of native tokens with sensible significant digits. */
export function formatTokenAmount(amount: number, maxFrac = 6): string {
  if (amount === 0) return "0";
  if (amount > 0 && amount < 0.000001) return "<0.000001";
  return amount.toLocaleString("en-US", {
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
  });
}

/** Format a USD value. */
export function formatUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

/** Truncate a long address: `0x1234… abcd`. */
export function shortenAddress(address: string, head = 6, tail = 4): string {
  if (!address) return "";
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

/** Relative "time ago" label for transaction timestamps. */
export function timeAgo(epochMs: number): string {
  const seconds = Math.floor((Date.now() - epochMs) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(epochMs).toLocaleDateString();
}
