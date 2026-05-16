"use client";

import { useEffect, useMemo } from "react";
import {
  useAccount,
  useBlockNumber,
  useReadContracts,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

import {
  abis,
  contractAddresses,
  contractsReady,
  TOKEN_SYMBOLS,
  type TokenSymbol,
} from "@/lib/contracts";
import type { UiOrder } from "@/lib/mock-orderbook";

export interface UserOrder extends UiOrder {
  symbol: TokenSymbol;
}

interface UserOrdersResult {
  orders: UserOrder[];
  isLoading: boolean;
  refetch: () => void;
}

/// Read getOrdersForToken for every SecurityToken, flatten, then keep only
/// orders where the connected wallet is the maker AND the order is active.
export function useUserActiveOrders(): UserOrdersResult {
  const { address } = useAccount();
  const enabled = !!address && contractsReady;

  const { data, isLoading, refetch, queryKey } = useReadContracts({
    contracts: enabled
      ? TOKEN_SYMBOLS.map((sym) => ({
          abi: abis.orderbook,
          address: contractAddresses.orderbook,
          functionName: "getOrdersForToken" as const,
          args: [contractAddresses.tokens[sym]] as const,
        }))
      : [],
    query: { enabled },
  });

  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: enabled });
  useEffect(() => {
    if (!enabled) return;
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, enabled, queryClient, queryKey]);

  return useMemo<UserOrdersResult>(() => {
    if (!enabled || !data) {
      return { orders: [], isLoading, refetch };
    }
    const all: UserOrder[] = [];
    TOKEN_SYMBOLS.forEach((sym, i) => {
      const result = data[i]?.result as readonly UiOrder[] | undefined;
      if (!result) return;
      for (const o of result) {
        if (!o.active) continue;
        if (o.maker.toLowerCase() !== address!.toLowerCase()) continue;
        all.push({ ...o, symbol: sym });
      }
    });
    // Newest first
    all.sort((a, b) => (a.id > b.id ? -1 : a.id < b.id ? 1 : 0));
    return { orders: all, isLoading, refetch };
  }, [data, enabled, isLoading, refetch, address]);
}
