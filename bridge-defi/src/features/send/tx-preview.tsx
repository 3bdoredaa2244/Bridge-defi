"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChainIcon } from "@/components/common/chain-icon";
import { shortenAddress } from "@/lib/format";
import type { ChainMeta } from "@/types/chain";

interface TxPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chain: ChainMeta;
  from: string;
  to: string;
  amount: string;
  /** Network fee estimate in display units, when known. */
  feeEstimate?: string;
  submitting: boolean;
  onConfirm: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export function TxPreview({
  open,
  onOpenChange,
  chain,
  from,
  to,
  amount,
  feeEstimate,
  submitting,
  onConfirm,
}: TxPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review transaction</DialogTitle>
          <DialogDescription>
            Signed inside the MeneseSDK canister, then broadcast from your
            browser via your configured {chain.name} RPC.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-center gap-3 py-2">
            <ChainIcon chain={chain} size="lg" />
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {amount}{" "}
                <span className="text-base text-muted-foreground">
                  {chain.symbol}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">on {chain.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Row label="From">
            <span className="font-mono">{shortenAddress(from, 8, 6)}</span>
          </Row>
          <div className="flex justify-center text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
          </div>
          <Row label="To">
            <span className="font-mono">{shortenAddress(to, 8, 6)}</span>
          </Row>
          <Separator />
          <Row label="Network">{chain.name}</Row>
          <Row label="Network fee">
            {feeEstimate ? `~${feeEstimate} ${chain.symbol}` : "Estimated at send"}
          </Row>
          <Row label="Mode">Sign &amp; Broadcast</Row>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Signing & broadcasting…" : "Confirm & send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
