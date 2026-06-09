"use client";

import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { RequireAuth } from "@/components/common/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { PortfolioSummary } from "@/features/portfolio/portfolio-summary";
import { AssetList } from "@/features/portfolio/asset-list";
import { TxList } from "@/features/transactions/tx-list";
import { usePortfolio } from "@/features/portfolio/use-portfolio";

function QuickActions() {
  const actions = [
    {
      href: "/send",
      label: "Send",
      description: "Sign & broadcast",
      Icon: ArrowUpFromLine,
    },
    {
      href: "/receive",
      label: "Receive",
      description: "Show address & QR",
      Icon: ArrowDownToLine,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ href, label, description, Icon }) => (
        <Link key={href} href={href}>
          <Card className="transition-colors hover:border-primary/50 hover:bg-accent/40">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function DashboardContent() {
  const portfolio = usePortfolio();
  return (
    <div className="space-y-6">
      <PortfolioSummary portfolio={portfolio} />
      <QuickActions />
      <div className="grid gap-6 lg:grid-cols-2">
        <AssetList portfolio={portfolio} />
        <TxList limit={6} title="Recent activity" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
