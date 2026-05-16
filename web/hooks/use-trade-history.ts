"use client";

import { useEffect, useState } from "react";
import { useAccount, useBlockNumber, usePublicClient } from "wagmi";
import { decodeEventLog, parseAbiItem } from "viem";

import {
  abis,
  contractAddresses,
  contractsReady,
  TOKEN_SYMBOLS,
  type TokenSymbol,
} from "@/lib/contracts";

export type HistoryRole = "maker" | "taker";

export interface TradeHistoryEntry {
  orderId: bigint;
  blockNumber: bigint;
  txHash: `0x${string}`;
  symbol: TokenSymbol | "?";
  isBuy: boolean;          // direction of the maker's order
  amount: bigint;          // token base units
  totalUsdc: bigint;       // USDC base units
  fee: bigint;             // USDC base units
  role: HistoryRole;       // role of the connected user
  counterparty: `0x${string}`;
}

const ORDER_FILLED = parseAbiItem(
  "event OrderFilled(uint256 indexed id, address indexed taker, uint256 amount, uint256 totalUsdc, uint256 fee)"
);

function symbolOf(tokenAddress: `0x${string}`): TokenSymbol | "?" {
  const lower = tokenAddress.toLowerCase();
  for (const sym of TOKEN_SYMBOLS) {
    if (contractAddresses.tokens[sym].toLowerCase() === lower) return sym;
  }
  return "?";
}

/// Reads the full OrderFilled history (cheap — we expect tens of fills, not
/// thousands). For each fill, calls getOrder(id) to recover maker and isBuy
/// so the UI can label the row direction. Filters to entries where the
/// connected user was either maker or taker.
export function useTradeHistory(): {
  entries: TradeHistoryEntry[];
  isLoading: boolean;
  refetch: () => void;
} {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: !!address && contractsReady });

  const [entries, setEntries] = useState<TradeHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!address || !contractsReady || !publicClient) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const logs = await publicClient.getLogs({
          address: contractAddresses.orderbook,
          event: ORDER_FILLED,
          fromBlock: "earliest",
          toBlock: "latest",
        });
        const userLower = address.toLowerCase();

        const out: TradeHistoryEntry[] = [];
        for (const log of logs) {
          const decoded = decodeEventLog({
            abi: [ORDER_FILLED],
            data: log.data,
            topics: log.topics,
          });
          const id = decoded.args.id;
          const taker = decoded.args.taker;

          // Pull maker side from getOrder(id)
          const order = await publicClient.readContract({
            abi: abis.orderbook,
            address: contractAddresses.orderbook,
            functionName: "getOrder",
            args: [id],
          });

          const makerLower = order.maker.toLowerCase();
          const takerLower = taker.toLowerCase();

          if (makerLower !== userLower && takerLower !== userLower) continue;

          const role: HistoryRole = makerLower === userLower ? "maker" : "taker";
          const counterparty =
            role === "maker" ? taker : (order.maker as `0x${string}`);

          out.push({
            orderId: id,
            blockNumber: log.blockNumber ?? 0n,
            txHash: log.transactionHash ?? ("0x" as `0x${string}`),
            symbol: symbolOf(order.token as `0x${string}`),
            isBuy: order.isBuy,
            amount: decoded.args.amount,
            totalUsdc: decoded.args.totalUsdc,
            fee: decoded.args.fee,
            role,
            counterparty,
          });
        }
        out.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        if (!cancelled) setEntries(out);
      } catch (err) {
        if (!cancelled) {
          console.error("trade history fetch failed", err);
          setEntries([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // refetch on every new block (cheap cache) and when address flips
  }, [address, publicClient, blockNumber, tick]);

  return { entries, isLoading, refetch: () => setTick((t) => t + 1) };
}
