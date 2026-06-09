"use client";

import { LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/features/auth/use-auth";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/copy-button";
import { shortenAddress } from "@/lib/format";

export function ConnectButton() {
  const { isConnected, isConnecting, principal, connect, disconnect } =
    useAuth();

  if (isConnected && principal) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 sm:flex">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="font-mono text-xs text-muted-foreground">
            {shortenAddress(principal, 6, 4)}
          </span>
          <CopyButton value={principal} label="principal" className="h-6 w-6" />
        </div>
        <Button variant="outline" size="sm" onClick={disconnect}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} disabled={isConnecting} size="sm">
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting…" : "Connect Identity"}
    </Button>
  );
}
