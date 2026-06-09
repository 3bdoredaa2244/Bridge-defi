import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { ErrorBoundary } from "@/components/common/error-boundary";

/** The persistent application chrome: sidebar + topbar + content + mobile nav. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-8">
          <div className="mx-auto w-full max-w-5xl animate-fade-in">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
