"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { toast } from "sonner";

import {
  abis,
  Address,
  contractAddresses,
  contractsReady,
} from "@/lib/contracts";

export type PlaceOrderState = "idle" | "approving" | "placing" | "success" | "error";

interface PlaceOrderArgs {
  token: Address;
  isBuy: boolean;
  amount: bigint; // SecurityToken units (18 decimals)
  price: bigint; // USDC base units (6 decimals)
}

interface UsePlaceOrderResult {
  state: PlaceOrderState;
  txHash: `0x${string}` | undefined;
  errorMessage: string | undefined;
  submit: (args: PlaceOrderArgs) => Promise<void>;
  reset: () => void;
}

const TOKEN_UNIT = 10n ** 18n;
const FEE_BPS = 30n;
const FEE_DENOMINATOR = 10_000n;

function totalUsdc(amount: bigint, price: bigint): bigint {
  return (amount * price) / TOKEN_UNIT;
}

function withFee(value: bigint): bigint {
  return value + (value * FEE_BPS) / FEE_DENOMINATOR;
}

function explorerUrl(hash: string): string {
  return `https://testnet.snowtrace.io/tx/${hash}`;
}

/// Encapsulates the two-tx flow: approve the right asset (USDC for buys, the
/// SecurityToken for sells), then call placeOrder. Returns a state machine
/// and the latest tx hash so the UI can render progress and a Snowtrace link.
export function usePlaceOrder(): UsePlaceOrderResult {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<PlaceOrderState>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const reset = useCallback(() => {
    setState("idle");
    setTxHash(undefined);
    setErrorMessage(undefined);
  }, []);

  const submit = useCallback(
    async ({ token, isBuy, amount, price }: PlaceOrderArgs) => {
      if (!address) {
        toast.error("Conecta tu wallet primero");
        return;
      }
      if (!contractsReady) {
        toast.error("Los contratos aún no están desplegados en Fuji");
        return;
      }
      if (!publicClient) {
        toast.error("RPC no disponible");
        return;
      }

      setErrorMessage(undefined);
      try {
        // 1. Approve
        setState("approving");
        const approveAsset = isBuy ? contractAddresses.usdc : token;
        const approveAmount = isBuy ? withFee(totalUsdc(amount, price)) : amount;
        const approveAbi = isBuy ? abis.usdc : abis.securityToken;

        const approveHash = await writeContractAsync({
          abi: approveAbi,
          address: approveAsset,
          functionName: "approve",
          args: [contractAddresses.orderbook, approveAmount],
        });
        setTxHash(approveHash);
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // 2. placeOrder
        setState("placing");
        const placeHash = await writeContractAsync({
          abi: abis.orderbook,
          address: contractAddresses.orderbook,
          functionName: "placeOrder",
          args: [token, isBuy, amount, price],
        });
        setTxHash(placeHash);
        await publicClient.waitForTransactionReceipt({ hash: placeHash });

        setState("success");
        toast.success("Orden colocada", {
          description: "La orden ya está en el orderbook on-chain",
          action: { label: "Ver tx", onClick: () => window.open(explorerUrl(placeHash), "_blank") },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const short = message.split("\n")[0].slice(0, 140);
        setErrorMessage(short);
        setState("error");
        toast.error("La orden falló", { description: short });
      }
    },
    [address, publicClient, writeContractAsync]
  );

  return { state, txHash, errorMessage, submit, reset };
}
