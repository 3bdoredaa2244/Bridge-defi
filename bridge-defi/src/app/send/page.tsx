"use client";

import { RequireAuth } from "@/components/common/require-auth";
import { SendForm } from "@/features/send/send-form";

export default function SendPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-xl">
        <SendForm />
      </div>
    </RequireAuth>
  );
}
