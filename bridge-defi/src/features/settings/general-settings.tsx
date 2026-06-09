"use client";

import { Activity, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/store/settings-store";
import { useTransactionsStore } from "@/store/transactions-store";
import { useCanisterHealth } from "./use-canister-health";
import { useAuth } from "@/features/auth/use-auth";
import { env } from "@/config/env";
import { shortenAddress } from "@/lib/format";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: typeof Eye;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function GeneralSettings() {
  const { principal } = useAuth();
  const hideZero = useSettingsStore((s) => s.hideZeroBalances);
  const setHideZero = useSettingsStore((s) => s.setHideZeroBalances);
  const removeForPrincipal = useTransactionsStore((s) => s.removeForPrincipal);
  const health = useCanisterHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Display preferences, connection details, and local data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ToggleRow
          icon={Eye}
          label="Hide zero balances"
          description="Only show chains with a positive balance on the dashboard."
          checked={hideZero}
          onChange={setHideZero}
        />

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">MeneseSDK canister</span>
            <code className="font-mono text-xs">{env.meneseCanisterId}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your principal</span>
            <code className="font-mono text-xs">
              {principal ? shortenAddress(principal, 8, 6) : "—"}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              Canister status
            </span>
            {health.isLoading ? (
              <Badge variant="secondary">Checking…</Badge>
            ) : health.isError ? (
              <Badge variant="destructive">Unreachable</Badge>
            ) : (
              <Badge variant="success">
                {health.data?.health ?? "OK"}
                {health.data?.version ? ` · v${health.data.version}` : ""}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Clear transaction history</p>
            <p className="text-xs text-muted-foreground">
              Removes locally-stored records for this identity. On-chain
              transactions are unaffected.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (principal) removeForPrincipal(principal);
              toast.success("Transaction history cleared");
            }}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
