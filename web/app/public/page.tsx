import { AssetCard } from "@/components/asset-card";
import { aggregateStats, companiesByUniverse } from "@/lib/mock-companies";
import { formatInt, formatUsdcCompact } from "@/lib/format";

interface Stat {
  label: string;
  value: string;
}

export default function PublicMarketplacePage() {
  const stats = aggregateStats("public");
  const companies = companiesByUniverse("public");

  const cards: Stat[] = [
    { label: "Market cap agregado", value: formatUsdcCompact(stats.tvl) },
    { label: "Tickers listados", value: formatInt(stats.companies) },
    { label: "Volumen 24h", value: formatUsdcCompact(stats.volume24h) },
    { label: "Fuente de precio", value: "Dinari" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-3 border-b border-border/60 pb-8">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Public equity · Powered by Dinari
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Acciones públicas de EE.UU. tokenizadas vía Dinari, líquidas en Tessera.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tessera sirve precios y metadata reales del sandbox de Dinari para
          AAPL, MSFT, NVDA, GOOGL, AMZN y META. El secundario corre sobre
          nuestro orderbook en Avalanche Fuji con la misma capa de KYC que el
          lado privado — verifica una vez, opera en ambos universos.
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
            Tickers listados
          </h2>
          <p className="text-xs text-muted-foreground">
            Precios live desde Dinari sandbox · Settlement on-chain en Fuji
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <AssetCard key={company.symbol} company={company} />
          ))}
        </div>
      </section>
    </main>
  );
}
