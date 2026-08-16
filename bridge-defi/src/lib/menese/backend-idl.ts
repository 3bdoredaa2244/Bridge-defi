/**
 * Candid interface of the Bridge.defi backend canister
 * (`backend/BridgeDefiBackend.mo`).
 *
 * Generated from that source with:
 *   moc --idl backend/BridgeDefiBackend.mo
 * and transcribed here so the frontend has no build-time dependency on dfx.
 * Keep in sync if the Motoko service signature changes.
 */

import type { IDL } from "@dfinity/candid";
import type { Principal } from "@dfinity/principal";

export const backendIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  // Motoko `Result.Result<(), Text>` → variant { ok; err : text }
  const Res = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  // Motoko `Result.Result<[Principal], Text>`
  const ResultUsers = IDL.Variant({
    ok: IDL.Vec(IDL.Principal),
    err: IDL.Text,
  });

  return IDL.Service({
    onUserLogin: IDL.Func([], [Res], []),
    whoami: IDL.Func([], [IDL.Principal], ["query"]),
    config: IDL.Func(
      [],
      [
        IDL.Record({
          backendCanisterId: IDL.Principal,
          meneseCanisterId: IDL.Text,
          registrationCount: IDL.Nat,
        }),
      ],
      ["query"],
    ),
    listBilledUsers: IDL.Func([], [ResultUsers], []),
    unregisterUser: IDL.Func([IDL.Principal], [Res], []),
  });
};

/** Motoko `Result<(), Text>` as decoded by @dfinity/agent. */
export type BackendResult = { ok: null } | { err: string };

export interface BackendConfig {
  backendCanisterId: Principal;
  meneseCanisterId: string;
  registrationCount: bigint;
}

export interface BridgeBackendService {
  onUserLogin: () => Promise<BackendResult>;
  whoami: () => Promise<Principal>;
  config: () => Promise<BackendConfig>;
  listBilledUsers: () => Promise<{ ok: Principal[] } | { err: string }>;
  unregisterUser: (user: Principal) => Promise<BackendResult>;
}
