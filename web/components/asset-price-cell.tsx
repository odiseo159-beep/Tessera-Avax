"use client";

import { useLastPrice } from "@/hooks/use-last-price";
import type { Address, TokenSymbol } from "@/lib/contracts";
import { formatPercent, formatUsdc } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AssetPriceCellProps {
  symbol: TokenSymbol;
  tokenAddress: Address;
  fallbackChange24h: number;
  align?: "start" | "end";
}

export function AssetPriceCell({
  symbol,
  tokenAddress,
  fallbackChange24h,
  align = "end",
}: AssetPriceCellProps) {
  const { priceUsdc, fromChain } = useLastPrice(symbol, tokenAddress);
  const positive = fallbackChange24h >= 0;

  return (
    <div className={cn("flex flex-col", align === "end" ? "items-end" : "items-start")}>
      <span className="text-2xl font-semibold tabular-nums text-foreground">
        {formatUsdc(priceUsdc)}
      </span>
      <span
        className={cn(
          "text-xs tabular-nums",
          positive ? "text-[#0F6E56]" : "text-[#C03737]"
        )}
      >
        {formatPercent(fallbackChange24h)} · 24h · {fromChain ? "on-chain" : "mock"}
      </span>
    </div>
  );
}
