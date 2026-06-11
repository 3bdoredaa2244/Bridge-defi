"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Static-export-friendly entry point. `redirect()` from next/navigation is a
 * server-side primitive and is not allowed in `output: "export"`, so we route
 * to the dashboard on the client instead.
 */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}
