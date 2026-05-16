"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompanyMeta } from "@/lib/mock-companies";
import { formatPercent, formatUsdc } from "@/lib/format";
import { useLastPrice } from "@/hooks/use-last-price";
import { tokenAddressOf } from "@/lib/contracts";

interface AssetCardProps {
  company: CompanyMeta;
}

export function AssetCard({ company }: AssetCardProps) {
  const { priceUsdc, fromChain } = useLastPrice(
    company.symbol,
    tokenAddressOf(company.symbol)
  );

  const positive = company.change24h >= 0;

  return (
    <Card className="group relative overflow-hidden border-border/70 p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold"
            style={{ backgroundColor: company.logoBg, color: company.logoColor }}
          >
            {company.symbol}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{company.name}</p>
            <p className="text-xs text-muted-foreground">
              {company.sector} · {company.round}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-border/60 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          {company.country}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {company.description}
      </p>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Último precio</p>
          <p className="text-xl font-semibold tabular-nums text-foreground">
            {formatUsdc(priceUsdc)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              positive ? "text-[#0F6E56]" : "text-[#C03737]"
            )}
          >
            {formatPercent(company.change24h)}
          </span>
          <span className="text-[10px] text-muted-foreground">24h</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {fromChain ? "On-chain" : "Mock"} · ERC-3643
        </span>
        <Button asChild size="sm">
          <Link href={`/trade/${company.slug}`}>Trade</Link>
        </Button>
      </div>
    </Card>
  );
}
