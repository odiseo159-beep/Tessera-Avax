"use client";

import { useQuery } from "@tanstack/react-query";

export type RiskLevel = "verified" | "minimal" | "low" | "medium" | "high" | "critical";

export interface RiskOk {
  status: "ok";
  score: number;
  level: RiskLevel;
  reason: string;
  suspicious: boolean;
  patterns: number;
  transactions: number;
  analyzedAt: string;
}

export interface RiskNotConfigured {
  status: "not_configured";
}

export interface RiskNoData {
  status: "no_data";
}

export type RiskState = RiskOk | RiskNotConfigured | RiskNoData;

async function fetchRisk(address: string): Promise<RiskState> {
  const res = await fetch(`/api/risk/scan?address=${encodeURIComponent(address)}`);
  // 503 is our convention for "Wavy isn't configured yet"; pre-key state.
  if (res.status === 503) {
    const body = (await res.json().catch(() => ({}))) as { status?: string };
    return { status: body.status === "not_configured" ? "not_configured" : "not_configured" };
  }
  if (!res.ok) throw new Error(`Risk scan failed: ${res.status}`);
  return (await res.json()) as RiskState;
}

/// Pulls the cached risk score for the connected wallet. Refreshes
/// every 5 minutes — Wavy's tracker recomputes scores periodically
/// and we want fresh signal without hammering their API.
export function useRiskScore(address: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["risk-score", address],
    queryFn: () => fetchRisk(address!),
    enabled: !!address,
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
    retry: false,
  });
}
