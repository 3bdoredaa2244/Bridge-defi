"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPrincipalText,
  login as iiLogin,
  logout as iiLogout,
} from "@/lib/menese/actor";
import {
  ensureUserRegistered,
  resetRegistration,
} from "@/lib/menese/registration";
import { classifyError } from "@/lib/menese/errors";
import {
  useAuthStore,
  type RegistrationState,
} from "@/store/auth-store";

/**
 * Internet Identity auth hook. Hydrates the auth store from the cached
 * AuthClient on mount, and exposes connect/disconnect actions that keep
 * React Query caches consistent with the active identity.
 */
export function useAuth() {
  const {
    status,
    principal,
    error,
    registration,
    setStatus,
    setConnected,
    setError,
    setRegistration,
    reset,
  } = useAuthStore();
  const queryClient = useQueryClient();

  /**
   * Register the authenticated principal against the app's MeneseSDK
   * subscription. `ensureUserRegistered` memoises per principal, so this is
   * safe to invoke on both login and session rehydrate — the canister
   * round-trip happens at most once per page load, never per render.
   */
  const runRegistration = useCallback(
    async (who: string) => {
      setRegistration({ status: "pending" });
      try {
        const result = await ensureUserRegistered();
        const next: RegistrationState =
          result.status === "registered"
            ? { status: "registered" }
            : {
                status: "unavailable",
                message: result.reason ?? "Registration unavailable.",
              };
        setRegistration(next);
        if (next.status === "unavailable") {
          console.warn("[bridge.defi] %s not registered: %s", who, next.message);
        }
      } catch (e) {
        const err = classifyError(e, "registration", "onUserLogin");
        setRegistration({ status: "error", message: err.message });
        // Surfaced verbatim — a failed registration is why paid MeneseSDK
        // endpoints will trap, so it must not be swallowed.
        toast.error(err.message);
      }
    },
    [setRegistration],
  );

  // Rehydrate session on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await getPrincipalText();
      if (cancelled || !existing) return;
      setConnected(existing);
      await runRegistration(existing);
    })();
    return () => {
      cancelled = true;
    };
  }, [setConnected, runRegistration]);

  const connect = useCallback(async () => {
    setStatus("connecting");
    let p: string;
    try {
      p = await iiLogin();
    } catch (e) {
      // Internet Identity itself failed — distinct from a registration or
      // canister failure, and reported as such.
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
      toast.error(`Internet Identity authentication failed: ${message}`);
      return null;
    }

    setConnected(p);
    toast.success("Connected with Internet Identity");
    await runRegistration(p);
    await queryClient.invalidateQueries();
    return p;
  }, [queryClient, runRegistration, setConnected, setError, setStatus]);

  const disconnect = useCallback(async () => {
    await iiLogout();
    resetRegistration();
    reset();
    queryClient.clear();
    toast.info("Disconnected");
  }, [queryClient, reset]);

  return {
    status,
    principal,
    error,
    registration,
    isConnected: status === "connected" && !!principal,
    isConnecting: status === "connecting",
    /** True once the principal is billed to the app's subscription. */
    isRegistered: registration.status === "registered",
    connect,
    disconnect,
  };
}
