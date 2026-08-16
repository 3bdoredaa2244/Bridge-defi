import { create } from "zustand";

type AuthStatus = "idle" | "connecting" | "connected" | "error";

/**
 * MeneseSDK billing-registration state, tracked separately from auth so the
 * UI can tell "not signed in" apart from "signed in, but this principal is
 * not attached to a subscription".
 */
export type RegistrationState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "registered" }
  /** Backend canister not configured/deployed — registration not attempted. */
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

interface AuthState {
  status: AuthStatus;
  principal: string | null;
  error: string | null;
  registration: RegistrationState;
  setStatus: (status: AuthStatus) => void;
  setConnected: (principal: string) => void;
  setError: (error: string) => void;
  setRegistration: (registration: RegistrationState) => void;
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
  registration: { status: "idle" },
  setStatus: (status) => set({ status }),
  setConnected: (principal) =>
    set({ status: "connected", principal, error: null }),
  setError: (error) => set({ status: "error", error }),
  setRegistration: (registration) => set({ registration }),
  reset: () =>
    set({
      status: "idle",
      principal: null,
      error: null,
      registration: { status: "idle" },
    }),
}));
