import { AssetCard } from "@/components/asset-card";
import { COMPANIES, aggregateStats } from "@/lib/mock-companies";
import { formatInt, formatUsdcCompact } from "@/lib/format";

interface Stat {
  label: string;
  value: string;
  hint?: string;
}

export default function HomePage() {
  const stats = aggregateStats();

  const cards: Stat[] = [
    { label: "TVL", value: formatUsdcCompact(stats.tvl) },
    { label: "Empresas listadas", value: formatInt(stats.companies) },
    { label: "Volumen 24h", value: formatUsdcCompact(stats.volume24h) },
    { label: "Inversionistas", value: formatInt(stats.investors) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-3 border-b border-border/60 pb-8">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Marketplace · Avalanche Fuji
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Compra y vende equity privado tokenizado de empresas latinoamericanas.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Inversionistas verificados pueden tomar o ceder posición en empresas
          privadas en menos de un minuto. KYC reusable on-chain, compliance
          aplicado a nivel de smart contract.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/60 bg-card px-4 py-3"
            >
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pt-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Empresas listadas
          </h2>
          <p className="text-xs text-muted-foreground">
            Datos públicos de prensa · precios mock hasta el primer fill
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANIES.map((company) => (
            <AssetCard key={company.symbol} company={company} />
          ))}
        </div>
      </section>
    </main>
  );
}
