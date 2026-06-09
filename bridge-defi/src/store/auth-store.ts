import { create } from "zustand";

type AuthStatus = "idle" | "connecting" | "connected" | "error";

interface AuthState {
  status: AuthStatus;
  principal: string | null;
  error: string | null;
  setStatus: (status: AuthStatus) => void;
  setConnected: (principal: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

/**
 * Lightweight mirror of Internet Identity auth state for synchronous reads in
 * components. The source of truth is the AuthClient in `lib/menese/actor.ts`;
 * `useAuth` keeps the two in sync.
 */
export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  principal: null,
  error: null,
  setStatus: (status) => set({ status }),
  setConnected: (principal) =>
    set({ status: "connected", principal, error: null }),
  setError: (error) => set({ status: "error", error }),
  reset: () => set({ status: "idle", principal: null, error: null }),
}));
