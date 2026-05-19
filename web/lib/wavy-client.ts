/// Server-side Wavy Node client. Never imported by client components —
/// the API key lives in process.env on the server only. Routes under
/// /app/api/risk/* and /app/api/compliance/* call this and reshape the
/// response for the browser.
///
/// Source of truth for shapes: https://docs.wavynode.com/llms-full.txt
///
/// Auth: every request needs `x-api-key: ApiKey <key>` — the literal
/// "ApiKey " prefix is mandatory per their quickstart.

import "server-only";

const BASE = process.env.WAVY_API_BASE ?? "https://api.wavynode.com/v1";
const KEY = process.env.WAVY_API_KEY ?? "";
const PROJECT_ID = process.env.WAVY_PROJECT_ID ?? "";

export class WavyNotConfiguredError extends Error {
  constructor() {
    super("Wavy Node not configured. Set WAVY_API_KEY and WAVY_PROJECT_ID in .env.local.");
    this.name = "WavyNotConfiguredError";
  }
}

export function isWavyConfigured(): boolean {
  return Boolean(KEY && PROJECT_ID);
}

function headers(): HeadersInit {
  if (!KEY || !PROJECT_ID) throw new WavyNotConfiguredError();
  // The docs are emphatic: the header must be "ApiKey <key>" with the
  // literal word "ApiKey" as a prefix. We tolerate either form in the
  // env var (raw key OR pre-prefixed) so a paste from the dashboard
  // never breaks us.
  const value = KEY.startsWith("ApiKey ") ? KEY : `ApiKey ${KEY}`;
  return {
    "x-api-key": value,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/// Avalanche C-chain mainnet, per Wavy's chains table. We deploy on Fuji
/// (43113) for the demo, but Wavy's risk graph is chain-aware: passing
/// the mainnet chainId gets us the address's actual on-chain footprint
/// instead of empty testnet activity.
export const DEFAULT_CHAIN_ID = "43114";

interface WavyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function call<T>(path: string, init: RequestInit, revalidate: number): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers ?? {}) },
    next: { revalidate },
  });
  const body = (await res.json().catch(() => ({}))) as WavyEnvelope<T>;
  if (!res.ok || body.success === false) {
    const msg = body.message ?? body.error ?? `Wavy ${res.status} on ${path}`;
    throw new Error(String(msg).slice(0, 240));
  }
  if (body.data === undefined) {
    throw new Error(`Wavy returned no data on ${path}`);
  }
  return body.data;
}

// ── Response shapes (from docs.wavynode.com/llms-full.txt) ──────────────

export interface WavyChain {
  id: number;
  name: string;
  currency: string;
  type: string;
  explorer?: string;
}

export interface WavyAddressRegistration {
  id: number;
  address: string;
  description?: string;
  foreign_user_id?: string;
}

export type WavyRiskLevel =
  | "verified"
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface WavyRiskResult {
  analysisId: string;
  address: string;
  chainId: string;
  riskScore: number;        // 0–100
  riskLevel: WavyRiskLevel;
  riskReason: string;
  suspiciousActivity: boolean;
  patternsDetected: Array<{
    patternType: string;
    severity: string;
    confidence?: number;
    description?: string;
  }>;
  transactionsAnalyzed: number;
  completedAt: string;
}

interface ScanRiskBatch {
  total: number;
  missing: number;
  results: WavyRiskResult[];
}

// The /reports response shape isn't fully documented in the llms.txt
// dump — only the report-by-id endpoint is. Treat the list result as
// opaque and reshape at the route boundary.
export type WavyReportRecord = Record<string, unknown>;

// ── Operations ──────────────────────────────────────────────────────────

export function listChains(): Promise<WavyChain[]> {
  return call<WavyChain[]>("/chains", { method: "GET" }, 3600);
}

export function registerAddress(
  address: string,
  foreignUserId?: string,
  description?: string,
): Promise<WavyAddressRegistration> {
  return call<WavyAddressRegistration>(
    `/projects/${PROJECT_ID}/addresses`,
    {
      method: "POST",
      body: JSON.stringify({
        address,
        description,
        foreign_user_id: foreignUserId,
      }),
    },
    0,
  );
}

export async function scanRisk(
  address: string,
  chainId: string = DEFAULT_CHAIN_ID,
): Promise<WavyRiskResult | null> {
  const path = `/projects/${PROJECT_ID}/addresses/scan-risk?addresses=${encodeURIComponent(address)}&chainId=${chainId}`;
  const data = await call<ScanRiskBatch>(path, { method: "GET" }, 60);
  return data.results[0] ?? null;
}

export function listReports(opts: {
  period: string;       // YYYY-MM
  countryCode: string;  // MX | CO | SV | GT
  limit?: number;
}): Promise<WavyReportRecord[]> {
  const params = new URLSearchParams({
    projectId: PROJECT_ID,
    period: opts.period,
    countryCode: opts.countryCode,
    limit: String(opts.limit ?? 25),
  });
  return call<WavyReportRecord[]>(`/reports?${params.toString()}`, { method: "GET" }, 300);
}
