"use client";

import { useCallback, useState } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import { toast } from "sonner";

import { abis, contractAddresses, contractsReady } from "@/lib/contracts";

export type CancelState = "idle" | "submitting" | "success" | "error";

export function useCancelOrder() {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [state, setState] = useState<CancelState>("idle");
  const [pendingId, setPendingId] = useState<bigint | null>(null);

  const cancel = useCallback(
    async (orderId: bigint) => {
      if (!contractsReady) {
        toast.error("Los contratos no están desplegados");
        return;
      }
      if (!publicClient) {
        toast.error("RPC no disponible");
        return;
      }
      try {
        setState("submitting");
        setPendingId(orderId);
        const hash = await writeContractAsync({
          abi: abis.orderbook,
          address: contractAddresses.orderbook,
          functionName: "cancelOrder",
          args: [orderId],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        setState("success");
        toast.success("Orden cancelada", {
          description: `Order #${orderId.toString()}`,
          action: {
            label: "Ver tx",
            onClick: () =>
              window.open(`https://testnet.snowtrace.io/tx/${hash}`, "_blank"),
          },
        });
      } catch (err) {
        setState("error");
        const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
        toast.error("No se pudo cancelar", { description: msg.slice(0, 160) });
      } finally {
        setPendingId(null);
        setTimeout(() => setState("idle"), 1500);
      }
    },
    [publicClient, writeContractAsync]
  );

  return { cancel, state, pendingId };
}
