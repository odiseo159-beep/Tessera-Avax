"use client";

import { useLivePrice } from "@/hooks/use-live-price";
import { formatPercent, formatUsdc } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CompanyMeta } from "@/lib/mock-companies";

interface AssetPriceCellProps {
  company: CompanyMeta;
  align?: "start" | "end";
}

export function AssetPriceCell({ company, align = "end" }: AssetPriceCellProps) {
  const { priceUsdc, change24h, source } = useLivePrice(company);
  const positive = change24h >= 0;

  const sourceLabel =
    source === "onchain"
      ? "on-chain"
      : source === "dinari"
        ? "Dinari live"
        : "mock";

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
        {formatPercent(change24h)} · 24h · {sourceLabel}
      </span>
    </div>
  );
}
