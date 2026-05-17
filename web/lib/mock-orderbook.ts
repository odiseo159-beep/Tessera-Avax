import type { CompanyMeta } from "@/lib/mock-companies";
import { ZERO_ADDRESS } from "@/lib/contracts";

export interface UiOrder {
  id: bigint;
  maker: `0x${string}`;
  token: `0x${string}`;
  isBuy: boolean;
  amount: bigint; // SecurityToken units (18 decimals)
  price: bigint; // USDC base units (6 decimals)
  active: boolean;
}

const MOCK_MAKER: `0x${string}` = "0x000000000000000000000000000000000000DEAD";

/// Six mock orders per company (3 bids + 3 asks) bracketing the mock midprice.
/// Shape mirrors what scripts/seed.ts places on-chain so the UI looks identical
/// before and after a real deploy.
export function mockOrdersFor(company: CompanyMeta): UiOrder[] {
  const tokenUnit = 10n ** 18n;
  const usdcUnit = 10n ** 6n;
  // Floats (Public stocks like AAPL = 299.85) blow up BigInt(midPriceUsdc).
  // Convert to base units via Math.round so any decimal place is preserved.
  const midPrice = BigInt(Math.round(company.midPriceUsdc * Number(usdcUnit)));
  const cent = 10_000n;

  const bidOffsets = [-50n, -25n, -10n];
  const askOffsets = [10n, 25n, 50n];
  const amounts = [50n, 100n, 150n];

  const result: UiOrder[] = [];
  let nextId = 0n;

  for (let i = 0; i < 3; i++) {
    result.push({
      id: nextId++,
      maker: MOCK_MAKER,
      token: ZERO_ADDRESS,
      isBuy: true,
      amount: amounts[i] * tokenUnit,
      price: midPrice + bidOffsets[i] * cent,
      active: true,
    });
  }

  for (let i = 0; i < 3; i++) {
    result.push({
      id: nextId++,
      maker: MOCK_MAKER,
      token: ZERO_ADDRESS,
      isBuy: false,
      amount: amounts[i] * tokenUnit,
      price: midPrice + askOffsets[i] * cent,
      active: true,
    });
  }

  return result;
}

/// 30 daily price points walking from -1.5% to +1.5% around the midprice.
/// Deterministic per company so two renders produce the same series.
export function mockPriceSeries(company: CompanyMeta): Array<{ time: number; value: number }> {
  const days = 30;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let value = company.midPriceUsdc * 0.985;
  // Deterministic pseudo-random walk seeded by the symbol
  let seed = 0;
  for (const ch of company.symbol) seed = (seed * 31 + ch.charCodeAt(0)) | 0;

  const result: Array<{ time: number; value: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const drift = ((seed % 1000) / 1000 - 0.5) * 0.02; // ±1% per step
    value = Math.max(company.midPriceUsdc * 0.92, Math.min(company.midPriceUsdc * 1.08, value * (1 + drift)));
    result.push({ time: Math.floor(date.getTime() / 1000), value: Number(value.toFixed(3)) });
  }
  // Force the last point to be exactly the midprice so chart + price match
  result[result.length - 1].value = company.midPriceUsdc;
  return result;
}
