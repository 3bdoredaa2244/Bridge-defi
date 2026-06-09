import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultRpcEndpoints } from "@/config/env";
import type { ChainId } from "@/types/chain";

export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  /** Per-chain RPC endpoint overrides. Empty string ⇒ use the env default. */
  rpcOverrides: Partial<Record<ChainId, string>>;
  /** Whether to hide zero balances on the dashboard. */
  hideZeroBalances: boolean;
  /** Fiat currency (only USD wired today, kept for forward-compat). */
  currency: "USD";

  setRpcOverride: (chainId: ChainId, url: string) => void;
  resetRpcOverride: (chainId: ChainId) => void;
  setHideZeroBalances: (value: boolean) => void;
  /** Effective RPC URL for a chain (override → env default). */
  resolveRpc: (chainId: ChainId) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      rpcOverrides: {},
      hideZeroBalances: false,
      currency: "USD",

      setRpcOverride: (chainId, url) =>
        set((s) => ({
          rpcOverrides: { ...s.rpcOverrides, [chainId]: url.trim() },
        })),

      resetRpcOverride: (chainId) =>
        set((s) => {
          const next = { ...s.rpcOverrides };
          delete next[chainId];
          return { rpcOverrides: next };
        }),

      setHideZeroBalances: (value) => set({ hideZeroBalances: value }),

      resolveRpc: (chainId) => {
        const override = get().rpcOverrides[chainId];
        if (override && override.length > 0) return override;
        return defaultRpcEndpoints[chainId] ?? "";
      },
    }),
    {
      name: "bridge-defi.settings",
      partialize: (s) => ({
        rpcOverrides: s.rpcOverrides,
        hideZeroBalances: s.hideZeroBalances,
        currency: s.currency,
      }),
    },
  ),
);

/** Read the effective RPC URL outside of React (services, broadcasters). */
export function resolveRpcUrl(chainId: ChainId): string {
  return useSettingsStore.getState().resolveRpc(chainId);
}
