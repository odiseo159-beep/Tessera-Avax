/// Server-side Dinari client. Never imported by client components — the API
/// key + secret live in process.env on the server only. Routes under
/// /app/api/dinari/* call this and reshape the response.

import "server-only";

const BASE = process.env.DINARI_API_BASE ?? "https://api-enterprise.sandbox.dinari.com";
const KEY_ID = process.env.DINARI_API_KEY_ID ?? "";
const SECRET = process.env.DINARI_API_SECRET ?? "";

function headers(): HeadersInit {
  if (!KEY_ID || !SECRET) {
    throw new Error("Dinari credentials missing. Set DINARI_API_KEY_ID and DINARI_API_SECRET in .env.local.");
  }
  return {
    "X-API-Key-Id": KEY_ID,
    "X-API-Secret-Key": SECRET,
    Accept: "application/json",
  };
}

export interface DinariStock {
  id: string;
  symbol: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  is_tradable: boolean;
  is_fractionable: boolean;
  tokens: string[];
}

export interface DinariPrice {
  price: number;
  change: number;
  change_percent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  previous_close: number;
  volume: number;
  market_cap: number | null;
  timestamp: string;
}

export interface DinariMarketHours {
  is_market_open: boolean;
  current_session_open_dt: string | null;
  current_session_close_dt: string | null;
  next_session_open_dt: string | null;
  next_session_close_dt: string | null;
}

const REVALIDATE_PRICE = 30;    // seconds — current quote, refresh half a minute
const REVALIDATE_STATIC = 3600; // seconds — metadata changes rarely
const REVALIDATE_HISTORY = 300; // seconds — historical bars

async function get<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    next: { revalidate },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Dinari ${res.status} on ${path}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function listStocks(): Promise<DinariStock[]> {
  return get<DinariStock[]>("/api/v2/market_data/stocks/?page_size=100", REVALIDATE_STATIC);
}

export async function getStockPrice(stockId: string): Promise<DinariPrice> {
  return get<DinariPrice>(`/api/v2/market_data/stocks/${stockId}/current_price`, REVALIDATE_PRICE);
}

export type DinariTimespan = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface DinariHistoricalPoint {
  timestamp: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function getHistoricalPrices(
  stockId: string,
  timespan: DinariTimespan = "MONTH"
): Promise<DinariHistoricalPoint[]> {
  const path =
    `/api/v2/market_data/stocks/${stockId}/historical_prices/?timespan=${timespan}`;
  return get<DinariHistoricalPoint[]>(path, REVALIDATE_HISTORY);
}

export async function getMarketHours(): Promise<DinariMarketHours> {
  return get<DinariMarketHours>("/api/v2/market_data/market_hours/", REVALIDATE_PRICE);
}
