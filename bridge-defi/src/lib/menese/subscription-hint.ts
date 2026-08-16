/**
 * Turns MeneseSDK's bare "Subscription required" trap into an actionable
 * explanation, phrased in terms of *this deployment's* registration state.
 *
 * Kept separate from `registration.ts` so that installing the hint pulls in
 * only `config/env` — no `@dfinity/auth-client`, no actor construction. That
 * keeps it importable from Node scripts and free of the `errors.ts` →
 * `registration.ts` → `errors.ts` cycle.
 */

import { setSubscriptionHintProvider } from "./errors";
import { env } from "@/config/env";

/**
 * MeneseSDK endpoints confirmed callable without a subscription
 * (probed against urs2a-ziaaa-aaaad-aembq-cai with a fresh principal).
 */
export const FREE_ENDPOINTS = [
  "getMySolanaAddress",
  "getMyEvmAddress",
  "getMyXrpAddress",
  "getMyCardanoAddress",
  "health",
  "version",
] as const;

export function describeSubscriptionFailure(): string {
  if (!env.backendCanisterId) {
    return [
      "This Internet Identity principal is not covered by a MeneseSDK subscription, and Bridge.defi has no backend canister configured to register it.",
      "",
      "MeneseSDK only accepts registerUserForBilling from a canister registered via registerDeveloperCanister, so the browser cannot self-register.",
      "",
      "Fix: deploy backend/BridgeDefiBackend.mo to the IC, register it with registerDeveloperCanister, then set NEXT_PUBLIC_BRIDGE_BACKEND_CANISTER_ID.",
      "",
      `Endpoints that work without a subscription: ${FREE_ENDPOINTS.join(", ")}.`,
    ].join("\n");
  }
  return [
    `Registration ran against backend canister ${env.backendCanisterId}, but MeneseSDK still reports no subscription for this principal.`,
    "",
    "The developer subscription itself is most likely expired or out of actions. Check with:",
    `  dfx canister call ${env.meneseCanisterId} getMyGatewayAccount '()' --network ic`,
  ].join("\n");
}

// Installed on import so any module that can produce a subscription trap
// also carries the explanation for it.
setSubscriptionHintProvider(describeSubscriptionFailure);
