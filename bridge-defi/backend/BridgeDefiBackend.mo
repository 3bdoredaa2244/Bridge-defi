/**
 * Bridge.defi backend canister — MeneseSDK user-billing registration.
 *
 * WHY THIS CANISTER EXISTS
 * ────────────────────────
 * MeneseSDK bills its paid endpoints (getAllAddresses, getMyBitcoinAddress,
 * every send/sign call, …) against the *calling* principal. A browser user
 * authenticating with Internet Identity has no subscription of their own, so
 * those calls trap with:
 *
 *     Subscription required. No active subscription or actions exhausted.
 *
 * MeneseSDK resolves billing in this order:
 *
 *     1. caller whitelisted?              → free
 *     2. caller a registered canister?    → bill that canister's developer
 *     3. caller in the userToDev mapping? → bill the mapped developer  ← us
 *     4. otherwise                        → bill the caller directly
 *
 * `registerUserForBilling(user)` puts a user into mapping #3. MeneseSDK only
 * accepts that call from a principal previously registered via
 * `registerDeveloperCanister` — verified against mainnet:
 *
 *     registerUserForBilling from a plain user identity
 *       → err "Caller is not a registered developer canister."
 *
 * A browser therefore cannot self-register. This canister is that registered
 * developer canister: the frontend calls `onUserLogin()` and the IC guarantees
 * `caller` is the user's authenticated Internet Identity principal, which we
 * forward to MeneseSDK.
 *
 * DEPLOY
 * ──────
 *   dfx deploy bridge_defi_backend --network ic \
 *     --argument '(principal "<YOUR-DEVELOPER-IDENTITY-PRINCIPAL>")'
 *
 *   # then, from the identity that holds the MeneseSDK subscription:
 *   dfx canister call urs2a-ziaaa-aaaad-aembq-cai registerDeveloperCanister \
 *     '(principal "<THIS-CANISTER-ID>", "Bridge.defi")' --network ic
 *
 * The init argument is the *owner* — the identity allowed to call the
 * monitoring/admin methods below. It is NOT a user principal and is never a
 * billing identity; user principals are only ever supplied by the IC as
 * `caller`.
 */

import Principal "mo:base/Principal";
import Result "mo:base/Result";

persistent actor class BridgeDefiBackend(owner : Principal) = this {

  type Res = Result.Result<(), Text>;

  /// MeneseSDK production canister.
  let MENESE_SDK : Text = "urs2a-ziaaa-aaaad-aembq-cai";

  /// The subset of the MeneseSDK interface this canister needs.
  /// Signatures match the deployed candid at urs2a-ziaaa-aaaad-aembq-cai.
  let menese : actor {
    registerUserForBilling : (Principal) -> async Result.Result<(), Text>;
    unregisterUserFromBilling : (Principal) -> async Result.Result<(), Text>;
    getRegisteredUsers : () -> async Result.Result<[Principal], Text>;
  } = actor (MENESE_SDK);

  /// Number of successful registrations, for cheap observability.
  var registrationCount : Nat = 0;

  // ── Public: the one call the frontend makes ──────────────────────────

  /**
   * Register the *calling* Internet Identity principal against this app's
   * MeneseSDK developer subscription.
   *
   * `caller` is supplied and cryptographically verified by the IC, so a user
   * can only ever register themselves — there is no principal argument to
   * forge. Idempotent: MeneseSDK treats a repeat call for an already-mapped
   * user as a no-op, and it consumes no subscription actions.
   */
  public shared ({ caller }) func onUserLogin() : async Res {
    if (Principal.isAnonymous(caller)) {
      return #err(
        "Anonymous principal cannot be registered. Sign in with Internet Identity first."
      );
    };

    let result = await menese.registerUserForBilling(caller);
    switch (result) {
      case (#ok) {
        registrationCount += 1;
        #ok;
      };
      case (#err e) { #err e };
    };
  };

  // ── Public: read-only diagnostics ────────────────────────────────────

  /// Echo the caller back. Lets the frontend prove the principal the IC sees
  /// matches the one Internet Identity reports locally.
  public shared query ({ caller }) func whoami() : async Principal {
    caller;
  };

  /// Configuration this canister was built against.
  public query func config() : async {
    meneseCanisterId : Text;
    backendCanisterId : Principal;
    registrationCount : Nat;
  } {
    {
      meneseCanisterId = MENESE_SDK;
      backendCanisterId = Principal.fromActor(this);
      registrationCount;
    };
  };

  // ── Owner-only: monitoring and removal ───────────────────────────────

  /// Every user principal currently billed to this app's subscription.
  public shared ({ caller }) func listBilledUsers() : async Result.Result<[Principal], Text> {
    if (caller != owner) { return #err("Unauthorized: owner only.") };
    await menese.getRegisteredUsers();
  };

  /// Detach a user from this app's subscription (banned user, deleted account).
  public shared ({ caller }) func unregisterUser(user : Principal) : async Res {
    if (caller != owner) { return #err("Unauthorized: owner only.") };
    await menese.unregisterUserFromBilling(user);
  };
};
