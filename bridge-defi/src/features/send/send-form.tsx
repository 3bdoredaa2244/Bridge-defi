"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChainSelect } from "@/components/common/chain-select";
import { TxPreview } from "./tx-preview";
import { SendResult } from "./send-result";
import { useSend, type SendSuccess } from "./use-send";
import { useAddresses } from "@/features/receive/use-addresses";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { CHAINS, SENDABLE_CHAINS } from "@/lib/chains/registry";
import { validateAmount, validateRecipient } from "@/lib/validation";
import { formatTokenAmount, shortenAddress } from "@/lib/format";
import type { ChainId } from "@/types/chain";

export function SendForm() {
  const [chainId, setChainId] = useState<ChainId>("ethereum");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<SendSuccess | null>(null);

  const chain = CHAINS[chainId];
  const { data: addresses } = useAddresses();
  const { assets } = usePortfolio();
  const send = useSend();

  const from = addresses?.[chainId] ?? "";
  const available = useMemo(
    () => assets.find((a) => a.chainId === chainId)?.amount ?? 0,
    [assets, chainId],
  );

  const recipientResult = useMemo(
    () => validateRecipient(chain.kind, recipient),
    [chain.kind, recipient],
  );
  const amountResult = useMemo(
    () => validateAmount({ raw: amount, available }),
    [amount, available],
  );

  const canReview =
    !!from && recipientResult.valid && amountResult.valid && !send.isPending;

  function resetForm() {
    setRecipient("");
    setAmount("");
    setTouched(false);
  }

  async function handleConfirm() {
    try {
      const res = await send.mutateAsync({ chain, from, to: recipient, amount });
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setPreviewOpen(false);
      setResultOpen(true);
    }
  }

  function handleDone() {
    setResultOpen(false);
    if (result) resetForm();
    send.reset();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Send assets</CardTitle>
          <CardDescription>
            Transactions are signed inside the MeneseSDK canister and broadcast
            from your browser — Sign-and-Broadcast mode.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Network</Label>
            <ChainSelect
              value={chainId}
              onChange={(id) => {
                setChainId(id);
                setTouched(false);
              }}
              chains={SENDABLE_CHAINS}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient address</Label>
            <Input
              id="recipient"
              placeholder={`Enter a ${chain.name} address`}
              value={recipient}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setRecipient(e.target.value)}
              onBlur={() => setTouched(true)}
              className="font-mono"
              aria-invalid={touched && !recipientResult.valid}
            />
            {touched && !recipientResult.valid && recipient.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {recipientResult.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wallet className="h-3 w-3" />
                {formatTokenAmount(available)} {chain.symbol}
              </span>
            </div>
            <div className="relative">
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => setTouched(true)}
                className="pr-24"
                aria-invalid={touched && !amountResult.valid}
              />
              <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setAmount(String(available))}
                  disabled={available <= 0}
                >
                  Max
                </Button>
                <span className="pr-2 text-sm font-medium text-muted-foreground">
                  {chain.symbol}
                </span>
              </div>
            </div>
            {touched && !amountResult.valid && amount.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {amountResult.message}
              </p>
            )}
          </div>

          {from && (
            <p className="text-xs text-muted-foreground">
              Sending from{" "}
              <span className="font-mono text-foreground">
                {shortenAddress(from, 8, 6)}
              </span>
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!canReview}
            onClick={() => {
              setTouched(true);
              if (canReview) setPreviewOpen(true);
            }}
          >
            Review transaction
          </Button>
        </CardContent>
      </Card>

      <TxPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        chain={chain}
        from={from}
        to={recipient}
        amount={amount}
        submitting={send.isPending}
        onConfirm={handleConfirm}
      />

      <SendResult
        open={resultOpen}
        onOpenChange={(o) => {
          if (!o) handleDone();
          else setResultOpen(true);
        }}
        result={result}
        error={send.error?.message ?? null}
        onDone={handleDone}
      />
    </>
  );
}
