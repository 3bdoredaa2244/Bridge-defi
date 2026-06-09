"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPrincipalText,
  login as iiLogin,
  logout as iiLogout,
} from "@/lib/menese/actor";
import { useAuthStore } from "@/store/auth-store";

/**
 * Internet Identity auth hook. Hydrates the auth store from the cached
 * AuthClient on mount, and exposes connect/disconnect actions that keep
 * React Query caches consistent with the active identity.
 */
export function useAuth() {
  const { status, principal, error, setStatus, setConnected, setError, reset } =
    useAuthStore();
  const queryClient = useQueryClient();

  // Rehydrate session on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await getPrincipalText();
      if (cancelled) return;
      if (existing) setConnected(existing);
    })();
    return () => {
      cancelled = true;
    };
  }, [setConnected]);

  const connect = useCallback(async () => {
    setStatus("connecting");
    try {
      const p = await iiLogin();
      setConnected(p);
      await queryClient.invalidateQueries();
      toast.success("Connected with Internet Identity");
      return p;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
      toast.error(message);
      return null;
    }
  }, [queryClient, setConnected, setError, setStatus]);

  const disconnect = useCallback(async () => {
    await iiLogout();
    reset();
    queryClient.clear();
    toast.info("Disconnected");
  }, [queryClient, reset]);

  return {
    status,
    principal,
    error,
    isConnected: status === "connected" && !!principal,
    isConnecting: status === "connecting",
    connect,
    disconnect,
  };
}
