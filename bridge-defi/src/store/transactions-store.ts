import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TxRecord, TxStatus } from "@/types/transaction";

interface TransactionsState {
  /** All records across every principal; selectors scope by principal. */
  records: TxRecord[];
  add: (record: TxRecord) => void;
  update: (id: string, patch: Partial<TxRecord>) => void;
  setStatus: (id: string, status: TxStatus, patch?: Partial<TxRecord>) => void;
  removeForPrincipal: (principal: string) => void;
  clearAll: () => void;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      records: [],

      add: (record) =>
        set((s) => ({ records: [record, ...s.records] })),

      update: (id, patch) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r,
          ),
        })),

      setStatus: (id, status, patch) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id
              ? { ...r, ...patch, status, updatedAt: Date.now() }
              : r,
          ),
        })),

      removeForPrincipal: (principal) =>
        set((s) => ({
          records: s.records.filter((r) => r.principal !== principal),
        })),

      clearAll: () => set({ records: [] }),
    }),
    { name: "bridge-defi.transactions" },
  ),
);

/** Select the records belonging to a principal, newest first. */
export function selectRecordsFor(
  records: TxRecord[],
  principal: string | null,
): TxRecord[] {
  if (!principal) return [];
  return records.filter((r) => r.principal === principal);
}
