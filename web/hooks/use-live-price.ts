"use client";

import { useLastPrice } from "@/hooks/use-last-price";
import { useDinariPrice } from "@/hooks/use-dinari-price";
import { tokenAddressOf } from "@/lib/contracts";
import type { CompanyMeta } from "@/lib/mock-companies";

export interface LivePrice {
  priceUsdc: number;
  change24h: number;
  source: "onchain" | "dinari" | "mock";
  isLoading: boolean;
}

/// Unified price hook that returns the best live quote available for either
/// universe: on-chain `OrderFilled` for private, real Dinari sandbox quote for
/// public, mock mid-price as the fallback for both. Both underlying hooks are
/// always called (rules-of-hooks) and the inactive one short-circuits via its
/// `enabled` flag.
export function useLivePrice(company: CompanyMeta): LivePrice {
  const isPrivate = company.universe === "private";

  // Private side — uses on-chain orderbook events. Pass zero address for
  // public companies to keep the hook enabled-flag off.
  const onChain = useLastPrice(
    company.symbol,
    isPrivate ? tokenAddressOf(company.symbol) : "0x0000000000000000000000000000000000000000"
  );

  // Public side — pulls from /api/dinari/stocks/[id]/price. Undefined disables.
  const dinari = useDinariPrice(isPrivate ? undefined : company.dinariStockId);

  if (isPrivate) {
    return {
      priceUsdc: onChain.priceUsdc,
      change24h: company.change24h,
      source: onChain.fromChain ? "onchain" : "mock",
      isLoading: false,
    };
  }

  if (dinari.data) {
    return {
      priceUsdc: dinari.data.price,
      change24h: dinari.data.change_percent,
      source: "dinari",
      isLoading: false,
    };
  }

  return {
    priceUsdc: company.midPriceUsdc,
    change24h: company.change24h,
    source: "mock",
    isLoading: dinari.isLoading,
  };
}
