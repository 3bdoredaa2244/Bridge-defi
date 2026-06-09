"use client";

import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/copy-button";
import { shortenAddress } from "@/lib/format";
import type { SendSuccess } from "./use-send";

interface SendResultProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SendSuccess | null;
  error: string | null;
  onDone: () => void;
}

export function SendResult({
  open,
  onOpenChange,
  result,
  error,
  onDone,
}: SendResultProps) {
  const success = !!result && !error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">
            {success ? "Transaction sent" : "Transaction failed"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {success ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Transaction sent</h3>
                <p className="text-sm text-muted-foreground">
                  {result.amount} {result.chain.symbol} to{" "}
                  {shortenAddress(result.to, 6, 4)} on {result.chain.name}
                </p>
              </div>

              <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
                <code className="min-w-0 flex-1 break-all text-left font-mono text-xs">
                  {result.hash}
                </code>
                <CopyButton value={result.hash} label="tx hash" />
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Transaction failed</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {error ?? "An unknown error occurred."}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          {success && result.explorerUrl && (
            <Button variant="outline" asChild>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on explorer
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button onClick={onDone}>{success ? "Done" : "Try again"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
