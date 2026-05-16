import { notFound } from "next/navigation";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { DinariChart } from "@/components/dinari-chart";
import { TradeGrid } from "@/components/trade-grid";
import { AssetPriceCell } from "@/components/asset-price-cell";
import { companyBySlug } from "@/lib/mock-companies";
import { tokenAddressOf } from "@/lib/contracts";
import { formatUsdcCompact } from "@/lib/format";

interface PageProps {
  params: { symbol: string };
}

export default function PublicTradePage({ params }: PageProps) {
  const company = companyBySlug(params.symbol);
  if (!company || company.universe !== "public") notFound();

  const tokenAddress = tokenAddressOf(company.symbol);

  const stats = [
    { label: "Market cap", value: formatUsdcCompact(company.marketCapUsdc) },
    { label: "Volumen 24h", value: formatUsdcCompact(company.volume24hUsdc) },
    { label: "Sector", value: company.sector },
    { label: "Listing", value: company.round },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-4 border-b border-border/60 pb-6">
        {company.dinariLogoUrl ? (
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-border/40">
            <Image
              src={company.dinariLogoUrl}
              alt={`${company.name} logo`}
              width={32}
              height={32}
              unoptimized
            />
          </span>
        ) : (
          <span
            className="flex h-12 w-12 items-center justify-center rounded-lg text-base font-semibold"
            style={{ backgroundColor: company.logoBg, color: company.logoColor }}
          >
            {company.symbol}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {company.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {company.sector} · {company.round} · {company.country}
          </p>
        </div>

        <AssetPriceCell company={company} />

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Badge variant="outline" className="border-[#3C3489]/40 bg-[#ECEAFA] text-[#3C3489]">
            dShare · Dinari
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

      <p className="mt-3 text-[11px] text-muted-foreground">
        Precios y descripción son del sandbox real de Dinari. Settlement del
        secundario corre sobre nuestro orderbook on-chain en Avalanche Fuji —
        el token de este ticker ({company.symbol}) es una réplica SecurityToken
        que comparte la misma capa de KYC con el lado privado.
      </p>

      <div className="mt-6 rounded-lg border border-border/60 bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Precio (30d)</h2>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Dinari historical
          </span>
        </div>
        {company.dinariStockId ? (
          <DinariChart stockId={company.dinariStockId} timespan="MONTH" height={260} />
        ) : (
          <div className="h-[260px]" />
        )}
      </div>

      <div className="mt-6">
        <TradeGrid company={company} tokenAddress={tokenAddress} />
      </div>
    </main>
  );
}
