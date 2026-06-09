"use client";

import { RequireAuth } from "@/components/common/require-auth";
import { GeneralSettings } from "@/features/settings/general-settings";
import { RpcSettings } from "@/features/settings/rpc-settings";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <div className="space-y-6">
        <GeneralSettings />
        <RpcSettings />
      </div>
    </RequireAuth>
  );
}
