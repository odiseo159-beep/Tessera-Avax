"use client";

import { useQuery } from "@tanstack/react-query";

export interface DinariPriceClient {
  price: number;
  change_percent: number;
  volume: number;
  market_cap: number | null;
  timestamp: string;
}

async function fetchPrice(stockId: string): Promise<DinariPriceClient> {
  const res = await fetch(`/api/dinari/stocks/${stockId}/price`);
  if (!res.ok) throw new Error(`Failed to fetch Dinari price: ${res.status}`);
  return (await res.json()) as DinariPriceClient;
}

export function useDinariPrice(stockId: string | undefined) {
  return useQuery({
    queryKey: ["dinari-price", stockId],
    queryFn: () => fetchPrice(stockId!),
    enabled: !!stockId,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

export type DinariTimespan = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface DinariHistoricalPoint {
  time: number; // unix seconds
  value: number; // close price
}

async function fetchHistory(
  stockId: string,
  timespan: DinariTimespan
): Promise<DinariHistoricalPoint[]> {
  const res = await fetch(
    `/api/dinari/stocks/${stockId}/history?timespan=${timespan}`
  );
  if (!res.ok) throw new Error(`Failed to fetch Dinari history: ${res.status}`);
  const bars: Array<{ timestamp: number; close: number }> = await res.json();
  return bars
    .map((b) => ({ time: b.timestamp, value: b.close }))
    .sort((a, b) => a.time - b.time);
}

export function useDinariHistory(
  stockId: string | undefined,
  timespan: DinariTimespan = "MONTH"
) {
  return useQuery({
    queryKey: ["dinari-history", stockId, timespan],
    queryFn: () => fetchHistory(stockId!, timespan),
    enabled: !!stockId,
    staleTime: 5 * 60_000,
  });
}
