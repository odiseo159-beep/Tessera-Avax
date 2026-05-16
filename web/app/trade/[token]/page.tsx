import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PriceChart } from "@/components/price-chart";
import { TradeGrid } from "@/components/trade-grid";
import { companyBySlug } from "@/lib/mock-companies";
import { mockPriceSeries } from "@/lib/mock-orderbook";
import { tokenAddressOf } from "@/lib/contracts";
import { formatInt, formatPercent, formatUsdc, formatUsdcCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { token: string };
}

export default function TradePage({ params }: PageProps) {
  const company = companyBySlug(params.token);
  if (!company) notFound();

  const tokenAddress = tokenAddressOf(company.symbol);
  const series = mockPriceSeries(company);
  const positive = company.change24h >= 0;

  const stats = [
    { label: "Market cap", value: formatUsdcCompact(company.marketCapUsdc) },
    { label: "Volumen 24h", value: formatUsdcCompact(company.volume24hUsdc) },
    { label: "Holders", value: formatInt(company.holders) },
    { label: "Default rate", value: "0.4%" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-4 border-b border-border/60 pb-6">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-lg text-base font-semibold"
          style={{ backgroundColor: company.logoBg, color: company.logoColor }}
        >
          {company.symbol}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {company.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {company.sector} · {company.round} · {company.country}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {formatUsdc(company.midPriceUsdc)}
          </span>
          <span
            className={cn(
              "text-xs tabular-nums",
              positive ? "text-[#0F6E56]" : "text-[#C03737]"
            )}
          >
            {formatPercent(company.change24h)} · 24h
          </span>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Badge variant="outline" className="border-[#0F6E56]/40 bg-[#E7F3F0] text-[#0F6E56]">
            ERC-3643
          </Badge>
          <Badge variant="outline">KYC enforced</Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            {company.symbol}
          </Badge>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border/60 bg-card px-4 py-3"
          >
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-foreground">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-lg border border-border/60 bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Precio (30d)</h2>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Mock series
          </span>
        </div>
        <PriceChart data={series} height={260} />
      </div>

      <div className="mt-6">
        <TradeGrid company={company} tokenAddress={tokenAddress} />
      </div>
    </main>
  );
}
