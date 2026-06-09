"use client";

import { RequireAuth } from "@/components/common/require-auth";
import { TxStats } from "@/features/transactions/tx-stats";
import { TxList } from "@/features/transactions/tx-list";

export default function TransactionsPage() {
  return (
    <RequireAuth>
      <div className="space-y-6">
        <TxStats />
        <TxList />
      </div>
    </RequireAuth>
  );
}
