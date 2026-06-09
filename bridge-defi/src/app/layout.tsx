import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Bridge.defi — Multi-chain wallet",
    template: "%s · Bridge.defi",
  },
  description:
    "A non-custodial multi-chain crypto platform powered by MeneseSDK on the Internet Computer. Receive, send, and track assets across 18 chains.",
  applicationName: "Bridge.defi",
  keywords: ["crypto", "wallet", "multi-chain", "MeneseSDK", "Internet Computer", "DeFi"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b18" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
