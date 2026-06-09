"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

interface QrCodeProps {
  value: string;
  size?: number;
}

/** Renders an address as a QR code data-URL, themed for light/dark. */
export function QrCode({ value, size = 200 }: QrCodeProps) {
  const { resolvedTheme } = useTheme();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setDataUrl(null);
      return;
    }
    const dark = resolvedTheme === "dark";
    QRCode.toDataURL(value, {
      width: size * 2, // 2× for crispness on retina
      margin: 1,
      color: {
        dark: dark ? "#e2e8f0" : "#0f172a",
        light: "#00000000", // transparent — sits on the card background
      },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "QR error");
      });
    return () => {
      cancelled = true;
    };
  }, [value, size, resolvedTheme]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-destructive/40 text-xs text-destructive"
        style={{ width: size, height: size }}
      >
        {error}
      </div>
    );
  }

  if (!dataUrl) {
    return <Skeleton style={{ width: size, height: size }} className="rounded-xl" />;
  }

  return (
    <div
      className="rounded-xl border border-border bg-background p-3"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt="Address QR code"
        width={size - 24}
        height={size - 24}
        className="h-full w-full"
      />
    </div>
  );
}
