/**
 * Failure classification for the Internet Identity → registration → MeneseSDK
 * call chain.
 *
 * Every layer fails differently and each failure needs a different user
 * action, so we never collapse them into a generic message. The original
 * canister/agent text is always preserved on `detail` and always appears in
 * the rendered message — a trapped canister's own words are the most useful
 * diagnostic we have.
 */

/** Which layer of the stack failed. */
export type MeneseErrorKind =
  /** Not signed in, or the Internet Identity delegation is missing/expired. */
  | "auth"
  /** Sovereign Send / MeneseSDK user-billing registration failed. */
  | "registration"
  /** The canister ran, but refused: no subscription or actions exhausted. */
  | "subscription"
  /** The canister ran and rejected/trapped for some other reason. */
  | "canister"
  /** Never reached the canister — transport, CORS, DNS, boundary node. */
  | "network";

const KIND_LABEL: Record<MeneseErrorKind, string> = {
  auth: "Internet Identity authentication failed",
  registration: "Sovereign Send registration failed",
  subscription: "MeneseSDK subscription required",
  canister: "MeneseSDK canister call failed",
  network: "Network error",
};

export class MeneseError extends Error {
  readonly kind: MeneseErrorKind;
  /** Verbatim text from the agent/canister. Never rewritten. */
  readonly detail: string;
  /** Method that failed, when known (e.g. `getAllAddresses`). */
  readonly method?: string;
  /** Operator-facing next step. Rendered after the raw detail. */
  readonly hint?: string;

  constructor(
    kind: MeneseErrorKind,
    detail: string,
    opts: { method?: string; hint?: string; cause?: unknown } = {},
  ) {
    const where = opts.method ? ` (${opts.method})` : "";
    const hint = opts.hint ? `\n\n${opts.hint}` : "";
    super(`${KIND_LABEL[kind]}${where}: ${detail}${hint}`);
    this.name = "MeneseError";
    this.kind = kind;
    this.detail = detail;
    this.method = opts.method;
    this.hint = opts.hint;
    if (opts.cause !== undefined) this.cause = opts.cause;
  }
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * MeneseSDK signals "you have not paid" by trapping with an IC0503 reject
 * whose message embeds `Subscription required`. That string is the canister's
 * own wording, matched here rather than a status code because the reject code
 * (CanisterError) is shared with every other trap.
 */
function isSubscriptionTrap(text: string): boolean {
  return (
    text.includes("Subscription required") ||
    text.includes("actions exhausted") ||
    text.includes("No active subscription")
  );
}

function isTransportFailure(err: unknown, text: string): boolean {
  // `fetch` rejects with a bare TypeError for DNS/CORS/offline.
  if (err instanceof TypeError) return true;
  return (
    text.includes("Failed to fetch") ||
    text.includes("NetworkError") ||
    text.includes("ERR_CONNECTION") ||
    text.includes("ECONNREFUSED") ||
    text.includes("fetch failed") ||
    text.includes("timed out")
  );
}

function isAuthFailure(text: string): boolean {
  return (
    text.includes("Not authenticated") ||
    text.includes("delegation has expired") ||
    text.includes("Invalid delegation") ||
    text.includes("Invalid signature") ||
    text.includes("Specified sender delegation has expired")
  );
}

/**
 * Turn anything thrown inside the Menese call chain into a `MeneseError` with
 * the correct `kind`. Already-classified errors pass through untouched so the
 * innermost (most specific) diagnosis wins.
 *
 * @param fallback - kind to use when the text matches no known signature.
 */
export function classifyError(
  err: unknown,
  fallback: MeneseErrorKind = "canister",
  method?: string,
): MeneseError {
  if (err instanceof MeneseError) return err;

  const text = messageOf(err);

  if (isSubscriptionTrap(text)) {
    return new MeneseError("subscription", text, {
      method,
      cause: err,
      hint: subscriptionHint(),
    });
  }
  if (isAuthFailure(text)) {
    return new MeneseError("auth", text, {
      method,
      cause: err,
      hint: "Sign out and reconnect with Internet Identity to refresh the delegation.",
    });
  }
  if (isTransportFailure(err, text)) {
    return new MeneseError("network", text, { method, cause: err });
  }
  return new MeneseError(fallback, text, { method, cause: err });
}

/**
 * Explains a subscription trap in terms of *this* app's registration state.
 * Imported lazily to keep `errors.ts` free of config/actor dependencies.
 */
let subscriptionHintProvider: () => string = () =>
  "This principal is not covered by a MeneseSDK subscription.";

export function setSubscriptionHintProvider(fn: () => string): void {
  subscriptionHintProvider = fn;
}

function subscriptionHint(): string {
  try {
    return subscriptionHintProvider();
  } catch {
    return "This principal is not covered by a MeneseSDK subscription.";
  }
}
