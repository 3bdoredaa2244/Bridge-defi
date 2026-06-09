"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { executeSend, type SendOutcome } from "@/lib/menese/send";
import { useTransactions } from "@/features/transactions/use-transactions";
import { useAuth } from "@/features/auth/use-auth";
import { queryKeys } from "@/lib/query-keys";
import { toBaseUnits } from "@/lib/format";
import type { ChainMeta } from "@/types/chain";

export interface SendArgs {
  chain: ChainMeta;
  from: string;
  to: string;
  /** Display amount string, e.g. "0.25". */
  amount: string;
}

export interface SendSuccess extends SendOutcome {
  chain: ChainMeta;
  amount: string;
  to: string;
}

/**
 * Orchestrates a Sign-and-Broadcast send end-to-end:
 *   record pending → sign on canister → broadcast → confirm/fail →
 *   refresh balances. Every outcome is persisted to transaction history.
 */
export function useSend() {
  const queryClient = useQueryClient();
  const { principal } = useAuth();
  const { recordPending, markConfirmed, markFailed } = useTransactions();

  return useMutation<SendSuccess, Error, SendArgs>({
    mutationFn: async ({ chain, from, to, amount }) => {
      const amountBaseUnits = toBaseUnits(amount, chain.decimals);

      const txId = recordPending({
        chainId: chain.id,
        from,
        to,
        amount,
        symbol: chain.symbol,
      });

      try {
        const outcome = await executeSend({
          chain,
          from,
          to,
          amountBaseUnits,
          amountDisplay: amount,
        });
        markConfirmed(txId, outcome.hash, outcome.explorerUrl);
        return { ...outcome, chain, amount, to };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
        markFailed(txId, message);
        throw new Error(message);
      }
    },
    onSuccess: (result) => {
      toast.success(`Sent ${result.amount} ${result.chain.symbol}`);
      // Balances likely changed — refresh the portfolio for this identity.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.balances(principal),
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
