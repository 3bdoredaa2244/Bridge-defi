"use client";

import { usePathname } from "next/navigation";
import { ConnectButton } from "@/components/common/connect-button";
import { ThemeToggle } from "./theme-toggle";
import { NAV_ITEMS } from "./nav";

function currentTitle(pathname: string): { label: string; description: string } {
  const match = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  return match
    ? { label: match.label, description: match.description }
    : { label: "Bridge.defi", description: "Multi-chain wallet" };
}

export function Topbar() {
  const pathname = usePathname();
  const { label, description } = currentTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="leading-tight">
        <h1 className="text-base font-semibold sm:text-lg">{label}</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ConnectButton />
      </div>
    </header>
  );
}
