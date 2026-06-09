"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions } from "./use-transactions";
import { cn } from "@/lib/utils";

export function TxStats() {
  const { counts } = useTransactions();

  const items = [
    {
      label: "Pending",
      value: counts.pending,
      Icon: Clock,
      tint: "text-warning bg-warning/10",
    },
    {
      label: "Confirmed",
      value: counts.confirmed,
      Icon: CheckCircle2,
      tint: "text-success bg-success/10",
    },
    {
      label: "Failed",
      value: counts.failed,
      Icon: XCircle,
      tint: "text-destructive bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, Icon, tint }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                tint,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-semibold leading-none">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
