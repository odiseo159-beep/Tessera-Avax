import { useMemo } from "react";
import { useReadContract, useBlockNumber } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  abis,
  Address,
  contractAddresses,
  contractsReady,
} from "@/lib/contracts";
import { mockOrdersFor, UiOrder } from "@/lib/mock-orderbook";
import type { CompanyMeta } from "@/lib/mock-companies";

export interface OrdersResult {
  orders: UiOrder[];
  fromChain: boolean;
  isLoading: boolean;
  refetch: () => void;
}

/// Reads all orders for the given token from Orderbook.getOrdersForToken and
/// auto-refetches when new blocks land. Falls back to deterministic mock data
/// when the contracts are not deployed.
export function useOrders(company: CompanyMeta, tokenAddress: Address): OrdersResult {
  const enabled =
    contractsReady &&
    tokenAddress !== "0x0000000000000000000000000000000000000000";

  const { data, isLoading, refetch, queryKey } = useReadContract({
    abi: abis.orderbook,
    address: contractAddresses.orderbook,
    functionName: "getOrdersForToken",
    args: enabled ? [tokenAddress] : undefined,
    query: { enabled },
  });

  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: enabled });
  useEffect(() => {
    if (!enabled) return;
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, enabled, queryClient, queryKey]);

  return useMemo(() => {
    if (!enabled) {
      return {
        orders: mockOrdersFor(company),
        fromChain: false,
        isLoading: false,
        refetch,
      };
    }
    if (!data) {
      return { orders: [], fromChain: true, isLoading, refetch };
    }
    const orders: UiOrder[] = (data as readonly UiOrder[]).map((o) => ({
      id: o.id,
      maker: o.maker,
      token: o.token,
      isBuy: o.isBuy,
      amount: o.amount,
      price: o.price,
      active: o.active,
    }));
    return { orders, fromChain: true, isLoading, refetch };
  }, [data, enabled, isLoading, refetch, company]);
}

export interface OrderbookLevel {
  price: bigint;
  amount: bigint;
}

export interface GroupedOrderbook {
  bids: OrderbookLevel[]; // sorted desc by price
  asks: OrderbookLevel[]; // sorted asc by price
  bestBid: bigint | null;
  bestAsk: bigint | null;
  spread: bigint | null;
  mid: bigint | null;
}

/// Group active orders by price, separate into bid/ask sides.
export function groupOrderbook(orders: UiOrder[]): GroupedOrderbook {
  const bidMap = new Map<string, bigint>();
  const askMap = new Map<string, bigint>();
  for (const o of orders) {
    if (!o.active) continue;
    const target = o.isBuy ? bidMap : askMap;
    const key = o.price.toString();
    target.set(key, (target.get(key) ?? 0n) + o.amount);
  }
  const bids: OrderbookLevel[] = Array.from(bidMap.entries())
    .map(([price, amount]) => ({ price: BigInt(price), amount }))
    .sort((a, b) => (a.price > b.price ? -1 : a.price < b.price ? 1 : 0));
  const asks: OrderbookLevel[] = Array.from(askMap.entries())
    .map(([price, amount]) => ({ price: BigInt(price), amount }))
    .sort((a, b) => (a.price > b.price ? 1 : a.price < b.price ? -1 : 0));

  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  const spread = bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;
  const mid =
    bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2n : null;

  return { bids, asks, bestBid, bestAsk, spread, mid };
}
