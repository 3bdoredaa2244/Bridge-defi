"use client";

import { useMemo } from "react";
import {
  selectRecordsFor,
  useTransactionsStore,
} from "@/store/transactions-store";
import { useAuth } from "@/features/auth/use-auth";
import type { TxRecord, TxStatus } from "@/types/transaction";

export interface NewTxInput {
  chainId: TxRecord["chainId"];
  to: string;
  from: string;
  amount: string;
  symbol: string;
  fee?: string;
}

/** Transaction history scoped to the connected identity, plus record helpers. */
export function useTransactions() {
  const { principal } = useAuth();
  const records = useTransactionsStore((s) => s.records);
  const add = useTransactionsStore((s) => s.add);
  const setStatus = useTransactionsStore((s) => s.setStatus);

  const scoped = useMemo(
    () => selectRecordsFor(records, principal),
    [records, principal],
  );

  const counts = useMemo(() => {
    return scoped.reduce(
      (acc, r) => {
        acc[r.status] += 1;
        return acc;
      },
      { pending: 0, confirmed: 0, failed: 0 } as Record<TxStatus, number>,
    );
  }, [scoped]);

  /** Create a pending send record and return its id for later updates. */
  function recordPending(input: NewTxInput): string {
    if (!principal) throw new Error("No principal");
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Number(String(Date.now()).slice(-4)))}`;
    const now = Date.now();
    const record: TxRecord = {
      id,
      principal,
      direction: "send",
      status: "pending",
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    add(record);
    return id;
  }

  function markConfirmed(id: string, hash: string, explorerUrl: string) {
    setStatus(id, "confirmed", { hash, explorerUrl });
  }

  function markFailed(id: string, error: string) {
    setStatus(id, "failed", { error });
  }

  return {
    records: scoped,
    counts,
    recordPending,
    markConfirmed,
    markFailed,
  };
}
