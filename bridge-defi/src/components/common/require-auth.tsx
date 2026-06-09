"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Gates feature pages behind Internet Identity. Renders a connect prompt when
 * the user is not authenticated, otherwise renders children.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting, connect } = useAuth();

  if (isConnected) return <>{children}</>;

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Connect your identity</h2>
          <p className="text-sm text-muted-foreground">
            Bridge.defi derives your multi-chain wallet from your Internet
            Identity. No seed phrase — keys live inside the MeneseSDK canister.
          </p>
        </div>
        <Button onClick={connect} disabled={isConnecting} size="lg">
          {isConnecting ? "Connecting…" : "Connect with Internet Identity"}
        </Button>
      </CardContent>
    </Card>
  );
}
