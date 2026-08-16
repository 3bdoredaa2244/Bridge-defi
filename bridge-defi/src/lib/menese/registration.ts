/**
 * MeneseSDK user-billing registration.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  Internet Identity                                                   │
 * │        ↓  AuthClient.getIdentity().getPrincipal()                    │
 * │  User principal  (never hardcoded — always read from the delegation) │
 * │        ↓  backend.onUserLogin()   ← this module                      │
 * │  Bridge.defi backend canister (registered developer canister)        │
 * │        ↓  registerUserForBilling(caller)                             │
 * │  MeneseSDK  urs2a-ziaaa-aaaad-aembq-cai                              │
 * │        ↓  caller now resolves to our developer subscription          │
 * │  getAllAddresses()  → BTC / ETH / SOL / …                            │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * WHY A BACKEND CANISTER IS IN THE PATH
 * MeneseSDK rejects `registerUserForBilling` from anything that is not a
 * canister previously registered via `registerDeveloperCanister`. Verified
 * against mainnet from a plain user identity:
 *
 *     err = "Caller is not a registered developer canister."
 *
 * So the browser cannot self-register, and the user's principal is never sent
 * as an argument — the IC supplies it to the backend as `caller`, which makes
 * impersonation impossible.
 *
 * IDEMPOTENCE
 * `registerUserForBilling` is idempotent server-side and consumes no
 * subscription actions. On top of that we memoise the in-flight promise per
 * principal, so a page load performs at most one registration round-trip no
 * matter how many components or queries ask for it.
 */

import { getAuthClient, getBackendActor } from "./actor";
import { classifyError, MeneseError } from "./errors";
// Side-effect import: installs the subscription-failure explanation used by
// `classifyError`, so a trap raised anywhere in this chain is actionable.
import "./subscription-hint";
import { env } from "@/config/env";

export { describeSubscriptionFailure } from "./subscription-hint";

export type RegistrationStatus =
  /** Principal is mapped to the app's MeneseSDK subscription. */
  | "registered"
  /** No backend canister configured — registration could not be attempted. */
  | "unavailable";

export interface RegistrationResult {
  status: RegistrationStatus;
  principal: string;
  /** Human-readable explanation, present when `status` is not "registered". */
  reason?: string;
}

/**
 * One in-flight/settled registration per principal, for the lifetime of the
 * page. Keyed by principal so switching identity re-registers, and cleared on
 * logout. This is what keeps registration off the React render path.
 */
const attempts = new Map<string, Promise<RegistrationResult>>();

/** Last settled result per principal, for synchronous UI reads. */
const results = new Map<string, RegistrationResult>();

export function getRegistrationResult(
  principal: string | null,
): RegistrationResult | undefined {
  return principal ? results.get(principal) : undefined;
}

/** Drop memoised state. Call on logout so the next identity registers fresh. */
export function resetRegistration(): void {
  attempts.clear();
  results.clear();
}

/**
 * Ensure the currently authenticated principal is registered for billing.
 *
 * Safe to call from anywhere and as often as you like — the work happens once
 * per principal per page load. Resolves (rather than throws) when no backend
 * canister is configured, so callers can still reach MeneseSDK's free
 * endpoints; it throws only when a configured backend actually fails.
 *
 * @throws {MeneseError} kind `auth` if not signed in,
 *                       kind `registration` if the backend call fails.
 */
export function ensureUserRegistered(): Promise<RegistrationResult> {
  return (async () => {
    const client = await getAuthClient();
    if (!(await client.isAuthenticated())) {
      throw new MeneseError(
        "auth",
        "No Internet Identity session. Connect before registering.",
        { method: "ensureUserRegistered" },
      );
    }

    // The authenticated principal, read live from the delegation.
    const principal = client.getIdentity().getPrincipal().toText();

    const existing = attempts.get(principal);
    if (existing) return existing;

    const attempt = register(principal);
    attempts.set(principal, attempt);
    // A failed attempt must not be cached, or a transient network blip would
    // wedge the session until reload.
    attempt.catch(() => attempts.delete(principal));
    return attempt;
  })();
}

async function register(principal: string): Promise<RegistrationResult> {
  if (!env.backendCanisterId) {
    const result: RegistrationResult = {
      status: "unavailable",
      principal,
      reason:
        "NEXT_PUBLIC_BRIDGE_BACKEND_CANISTER_ID is not set. The Bridge.defi backend canister must be deployed to the IC and registered with MeneseSDK via registerDeveloperCanister before users can be billed to this app's subscription.",
    };
    results.set(principal, result);
    console.warn("[menese] registration skipped:", result.reason);
    return result;
  }

  let outcome: { ok: null } | { err: string };
  try {
    const backend = await getBackendActor();
    outcome = await backend.onUserLogin();
  } catch (err) {
    throw classifyError(err, "registration", "onUserLogin");
  }

  if ("err" in outcome) {
    // The backend surfaced MeneseSDK's own wording — keep it verbatim.
    throw new MeneseError("registration", outcome.err, {
      method: "onUserLogin",
      hint: registrationHint(outcome.err),
    });
  }

  const result: RegistrationResult = { status: "registered", principal };
  results.set(principal, result);
  return result;
}

function registrationHint(err: string): string {
  if (err.includes("not a registered developer canister")) {
    return [
      `The backend canister ${env.backendCanisterId} is deployed but not registered with MeneseSDK.`,
      "Run, from the identity that holds the subscription:",
      `  dfx canister call ${env.meneseCanisterId} registerDeveloperCanister '(principal "${env.backendCanisterId}", "Bridge.defi")' --network ic`,
    ].join("\n");
  }
  return "Check the backend canister's cycle balance and its MeneseSDK developer registration.";
}
