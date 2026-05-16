import { useReadContract } from "wagmi";
import { useMemo } from "react";
import { abis, Address, contractAddresses, contractsReady } from "@/lib/contracts";
import { companyBySymbol } from "@/lib/mock-companies";
import type { TokenSymbol } from "@/lib/contracts";

export interface LastPrice {
  /// USDC per token (human dollars, not base units).
  priceUsdc: number;
  /// True when the value comes from on-chain orders. False when we are still
  /// falling back to the mock midprice.
  fromChain: boolean;
}

/// Pulls the most recent OrderFilled price from the orderbook for a token.
/// Falls back to the mock midprice when the contracts are not yet deployed or
/// no fills have happened yet.
export function useLastPrice(symbol: TokenSymbol, tokenAddress: Address): LastPrice {
  const company = companyBySymbol(symbol);

  const enabled = contractsReady && tokenAddress !== "0x0000000000000000000000000000000000000000";

  const { data } = useReadContract({
    abi: abis.orderbook,
    address: contractAddresses.orderbook,
    functionName: "getOrdersForToken",
    args: enabled ? [tokenAddress] : undefined,
    query: { enabled },
  });

  return useMemo<LastPrice>(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { priceUsdc: company.midPriceUsdc, fromChain: false };
    }
    // Find the most recently filled order (active === false and not cancelled
    // — but we can't tell the difference on-chain without events, so we treat
    // any inactive order's price as the last trade for now).
    const inactive = data.filter((o) => !o.active);
    if (inactive.length === 0) {
      return { priceUsdc: company.midPriceUsdc, fromChain: false };
    }
    const last = inactive[inactive.length - 1];
    const price = Number(last.price) / 1_000_000;
    return { priceUsdc: price, fromChain: true };
  }, [data, company.midPriceUsdc]);
}
