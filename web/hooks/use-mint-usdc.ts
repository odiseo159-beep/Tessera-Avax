"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { toast } from "sonner";

import { abis, contractAddresses, contractsReady } from "@/lib/contracts";
import { parseViemError } from "@/lib/parse-error";

const USDC_UNIT = 10n ** 6n;
const DEFAULT_MINT = 10_000n * USDC_UNIT;

export type MintUsdcState = "idle" | "minting" | "success" | "error";

export function useMintUsdc() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [state, setState] = useState<MintUsdcState>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const mint = useCallback(
    async (amount: bigint = DEFAULT_MINT) => {
      if (!address) {
        toast.error("Conecta tu wallet primero");
        return;
      }
      if (!contractsReady) {
        toast.error("Los contratos no están desplegados");
        return;
      }
      if (!publicClient) {
        toast.error("RPC no disponible");
        return;
      }
      try {
        setState("minting");
        const hash = await writeContractAsync({
          abi: abis.usdc,
          address: contractAddresses.usdc,
          functionName: "mint",
          args: [address, amount],
        });
        setTxHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
        setState("success");
        toast.success(`Minted ${Number(amount / USDC_UNIT).toLocaleString()} USDC mock`);
      } catch (err) {
        setState("error");
        toast.error("No se pudo mintear", { description: parseViemError(err) });
      }
    },
    [address, publicClient, writeContractAsync]
  );

  return { mint, state, txHash };
}
