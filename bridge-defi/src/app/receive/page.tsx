"use client";

import { RequireAuth } from "@/components/common/require-auth";
import { ReceiveCard } from "@/features/receive/receive-card";

export default function ReceivePage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-xl">
        <ReceiveCard />
      </div>
    </RequireAuth>
  );
}
