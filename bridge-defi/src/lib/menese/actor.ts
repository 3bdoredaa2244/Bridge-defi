/**
 * Internet Identity auth + MeneseSDK actor creation.
 *
 * The AuthClient and authenticated actor are cached for the session so we
 * don't repeatedly re-create the agent. All calls run client-side only.
 */
import { Actor, HttpAgent, type Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { idlFactory } from "./idl";
import type { MeneseActor, MeneseService } from "./types";
import { env } from "@/config/env";

let authClientPromise: Promise<AuthClient> | null = null;
let cachedActor: MeneseActor | null = null;

/** One AuthClient per session. */
export async function getAuthClient(): Promise<AuthClient> {
  if (!authClientPromise) {
    authClientPromise = AuthClient.create({
      idleOptions: { disableIdle: true, disableDefaultIdleCallback: true },
    });
  }
  return authClientPromise;
}

async function buildActor(identity: Identity): Promise<MeneseActor> {
  const agent = await HttpAgent.create({
    host: env.icHost,
    identity,
  });
  // On mainnet the root key is embedded; only fetch it for local replicas.
  if (!env.icHost.includes("icp0.io") && !env.icHost.includes("ic0.app")) {
    await agent.fetchRootKey().catch((err) => {
      console.warn("[menese] fetchRootKey failed (non-mainnet host):", err);
    });
  }
  return Actor.createActor<MeneseService>(idlFactory, {
    agent,
    canisterId: env.meneseCanisterId,
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const client = await getAuthClient();
  return client.isAuthenticated();
}

export async function getPrincipalText(): Promise<string | null> {
  const client = await getAuthClient();
  if (!(await client.isAuthenticated())) return null;
  return client.getIdentity().getPrincipal().toText();
}

/** Trigger the Internet Identity login popup. Resolves once authenticated. */
export async function login(): Promise<string> {
  const client = await getAuthClient();
  await new Promise<void>((resolve, reject) => {
    client.login({
      identityProvider: env.iiProvider,
      // 7 days, expressed in nanoseconds.
      maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600) * BigInt(1_000_000_000),
      onSuccess: () => resolve(),
      onError: (err) => reject(new Error(err ?? "Login failed")),
    });
  });
  cachedActor = null; // identity changed → rebuild actor lazily
  const principal = client.getIdentity().getPrincipal().toText();
  return principal;
}

export async function logout(): Promise<void> {
  const client = await getAuthClient();
  await client.logout();
  cachedActor = null;
}

/**
 * Returns the authenticated MeneseSDK actor. Throws if the user is not
 * logged in — callers should gate on auth state before invoking.
 */
export async function getMeneseActor(): Promise<MeneseActor> {
  if (cachedActor) return cachedActor;
  const client = await getAuthClient();
  if (!(await client.isAuthenticated())) {
    throw new Error("Not authenticated — connect with Internet Identity first.");
  }
  cachedActor = await buildActor(client.getIdentity());
  return cachedActor;
}
