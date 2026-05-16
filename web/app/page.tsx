import Link from "next/link";
import { ArrowRight, ShieldCheck, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  href: string;
  eyebrow: string;
  badge: string;
  badgeClassName: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
}

const PRODUCTS: Product[] = [
  {
    href: "/private",
    eyebrow: "Private equity",
    badge: "ERC-3643 · LatAm",
    badgeClassName: "border-[#0F6E56]/40 bg-[#E7F3F0] text-[#0F6E56]",
    title: "Liquidez secundaria para equity privado latinoamericano",
    description:
      "SecurityTokens emitidos por Tessera, settlement atómico en nuestro orderbook on-chain. Kavak, Bitso, Clip y SPV de Arkangeles, deployados a Avalanche Fuji.",
    bullets: [
      "4 deals reales tokenizados, valuación pública agregada $63M",
      "Compliance enforced en `_update` del token (ERC-3643 inspired)",
      "Orderbook + escrow + fee 0.3% al taker, todo on-chain",
    ],
    cta: "Explora private equity",
  },
  {
    href: "/public",
    eyebrow: "Public equity",
    badge: "dShare · Powered by Dinari",
    badgeClassName: "border-[#3C3489]/40 bg-[#ECEAFA] text-[#3C3489]",
    title: "Acciones públicas US tokenizadas con datos live de Dinari",
    description:
      "AAPL, MSFT, NVDA, GOOGL, AMZN, META — precios y metadata directo del sandbox real de Dinari. El secundario corre en nuestro orderbook on-chain con la misma KYC del lado privado.",
    bullets: [
      "6 tickers mega-cap con precios y charts del sandbox de Dinari",
      "Tokens SecurityToken mirror en Fuji para liquidez intra-LatAm",
      "Misma capa de identidad — verifica una vez, opera en ambos",
    ],
    cta: "Explora public equity",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 border-b border-border/60 pb-10 text-center sm:text-left">
        <Badge
          variant="outline"
          className="mx-auto self-center border-border/70 bg-card text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:mx-0"
        >
          Avalanche LatAm Institucional · Fuji testnet
        </Badge>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Una sola identidad. Dos universos de activos. Liquidez en 60 segundos.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Tessera es una capa de mercado secundario sobre Avalanche. Empleados
          atrapados en equity privado de Kavak o Bitso se cruzan con
          inversionistas latinoamericanos que quieren exposure a NVDA o AAPL.
          La misma verificación KYC abre ambos lados.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#0F6E56]" />
            KYC reusable on-chain
          </span>
          <span className="hidden text-border/80 sm:inline">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-[#3C3489]" />
            Universo privado + público en la misma cuenta
          </span>
        </div>
      </section>

      <section className="grid gap-6 pt-10 sm:grid-cols-2">
        {PRODUCTS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {p.eyebrow}
              </span>
              <Badge variant="outline" className={p.badgeClassName}>
                {p.badge}
              </Badge>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {p.title}
            </h2>
            <p className="text-sm text-muted-foreground">{p.description}</p>

            <ul className="mt-1 space-y-2 text-xs text-muted-foreground">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center gap-1.5 pt-3 text-sm font-medium text-foreground">
              {p.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-12 grid gap-4 rounded-xl border border-border/60 bg-card p-6 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            1 · Conecta
          </p>
          <p className="mt-2 text-sm text-foreground">
            Core Wallet o MetaMask en Avalanche Fuji.
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            2 · Verifica KYC
          </p>
          <p className="mt-2 text-sm text-foreground">
            3 pasos en /kyc. Tu wallet queda atestada en el IdentityRegistry
            on-chain. Sirve para ambos universos.
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            3 · Opera
          </p>
          <p className="mt-2 text-sm text-foreground">
            Elige private equity LatAm o public equity US. Mismo orderbook,
            mismas reglas de compliance.
          </p>
        </div>
      </section>
    </main>
  );
}
