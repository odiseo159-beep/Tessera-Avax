"use client";

import { useEffect, useMemo } from "react";
import { useAccount, useBlockNumber, useReadContract, useReadContracts } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

import {
  abis,
  contractAddresses,
  contractsReady,
  TOKEN_SYMBOLS,
  type TokenSymbol,
} from "@/lib/contracts";

export interface TokenBalance {
  symbol: TokenSymbol;
  address: `0x${string}`;
  amount: bigint;
}

export interface UserBalances {
  usdc: bigint;
  tokens: TokenBalance[];
  isLoading: boolean;
  refetch: () => void;
}

export function useUserBalances(): UserBalances {
  const { address } = useAccount();
  const enabled = !!address && contractsReady;

  const usdcQuery = useReadContract({
    abi: abis.usdc,
    address: contractAddresses.usdc,
    functionName: "balanceOf",
    args: enabled ? [address!] : undefined,
    query: { enabled },
  });

  const tokensQuery = useReadContracts({
    contracts: enabled
      ? TOKEN_SYMBOLS.map((sym) => ({
          abi: abis.securityToken,
          address: contractAddresses.tokens[sym],
          functionName: "balanceOf" as const,
          args: [address!] as const,
        }))
      : [],
    query: { enabled },
  });

  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: enabled });
  useEffect(() => {
    if (!enabled) return;
    queryClient.invalidateQueries({ queryKey: usdcQuery.queryKey });
    queryClient.invalidateQueries({ queryKey: tokensQuery.queryKey });
  }, [blockNumber, enabled, queryClient, usdcQuery.queryKey, tokensQuery.queryKey]);

  return useMemo<UserBalances>(() => {
    const usdc = (usdcQuery.data as bigint | undefined) ?? 0n;
    const data = tokensQuery.data;
    const tokens = TOKEN_SYMBOLS.map((sym, i) => ({
      symbol: sym,
      address: contractAddresses.tokens[sym],
      amount: (data?.[i]?.result as bigint | undefined) ?? 0n,
    }));
    return {
      usdc,
      tokens,
      isLoading: usdcQuery.isLoading || tokensQuery.isLoading,
      refetch: () => {
        usdcQuery.refetch();
        tokensQuery.refetch();
      },
    };
  }, [usdcQuery, tokensQuery]);
}
