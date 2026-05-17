"use client";

import { AssetCard } from "./asset-card";
import { PHStat } from "./page-header-stat";
import { Subnav } from "./subnav";
import { companiesByUniverse, type Universe } from "@/lib/mock-companies";
import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/format";

interface MarketsPageProps {
  universe: Universe;
}

export function MarketsPage({ universe }: MarketsPageProps) {
  const isPrivate = universe === "private";
  const accent = isPrivate ? "#0F6E56" : "#3C3489";
  const shadow = isPrivate
    ? "0 0 0 3px rgba(15,110,86,0.16)"
    : "0 0 0 3px rgba(60,52,137,0.16)";
  const assets = companiesByUniverse(universe);
  const eyebrow = isPrivate
    ? "Tessera Private · LatAm equity"
    : "Tessera Public · US equity";
  const title = isPrivate
    ? "Equity privado de LatAm, tokenizado y operable on-chain."
    : "Equity público de US, en el mismo orderbook on-chain.";
  const lede = isPrivate
    ? "Kavak, Bitso, Clip y SPVs de Arkangeles tokenizados como SecurityTokens ERC-3643. Coloca y cancela en un orderbook auditable, compliance enforced en cada transferencia."
    : "Mega-caps con precios y metadata en vivo desde el sandbox de Dinari. Secundario sobre el mismo orderbook, settled en USDC.";

  // 4 seeded orders per public token, 6 per private token (per seed.ts +
  // deploy-public.ts). Showing the seeded count is honest: live count comes
  // from the trade page.
  const seedOrdersPer = isPrivate ? 6 : 4;
  const totalOrders = assets.length * seedOrdersPer;

  const registryShort =
    contractAddresses.identityRegistry !== ZERO_ADDRESS
      ? shortAddress(contractAddresses.identityRegistry)
      : "0x4d69…Ea96";
  const orderbookShort =
    contractAddresses.orderbook !== ZERO_ADDRESS
      ? shortAddress(contractAddresses.orderbook)
      : "0x830e…E042";

  return (
    <div className="page">
      <div className="page-inner">
        <header className="ph">
          <div>
            <div className="eyebrow">
              <span
                className="eyebrow-dot"
                style={{ background: accent, boxShadow: shadow }}
              />
              {eyebrow}
            </div>
            <h1 className="ph-h1">{title}</h1>
            <p className="ph-lede">{lede}</p>
          </div>
          <div className="ph-stats">
            <PHStat
              tag={isPrivate ? "tokens" : "tickers"}
              k={assets.length}
              sub={isPrivate ? "ERC-3643 enforced" : "Dinari sandbox"}
            />
            <PHStat
              tag="órdenes"
              k={totalOrders}
              sub="seedeadas en orderbook"
              live
            />
            <PHStat
              tag="compliance"
              k="ERC-3643"
              sub="IdentityRegistry compartido"
            />
            <PHStat
              tag={isPrivate ? "data" : "data feed"}
              k={isPrivate ? "on-chain" : "Dinari"}
              sub={isPrivate ? "fills via orderbook" : "actualiza cada 30s"}
            />
          </div>
        </header>

        <div className="section-head" style={{ marginTop: 8 }}>
          <Subnav active={universe} />
          <div className="section-meta">
            <span
              className="pol-dot is-live"
              style={
                isPrivate
                  ? {}
                  : {
                      background: "var(--accent)",
                      boxShadow: "0 0 0 3px rgba(60,52,137,0.16)",
                    }
              }
            />
            {isPrivate ? "orderbook on-chain · Fuji" : "powered by Dinari sandbox"}
          </div>
        </div>

        <div className="section-head">
          <h2 className="section-h2">
            {isPrivate ? "Empresas listadas" : "Tickers listados"}
          </h2>
          <span className="section-meta">
            <span className="mono">{assets.length}</span>
            <span>·</span>
            <span>orden: market cap ↓</span>
          </span>
        </div>

        <div className={`asset-grid ${isPrivate ? "is-private" : ""}`}>
          {assets.map((c) => (
            <AssetCard key={c.symbol} company={c} />
          ))}
        </div>

        <div
          className="pol-foot"
          style={{ padding: 0, marginTop: 36, marginLeft: 0, marginRight: 0 }}
        >
          <span className="pol-foot-item">
            <span className="pol-foot-label">{isPrivate ? "registry" : "orderbook"}</span>
            <span className="mono pol-foot-val">
              {isPrivate
                ? `IdentityRegistry @ ${registryShort}`
                : `shared orderbook @ ${orderbookShort}`}
            </span>
          </span>
          <span className="pol-foot-sep" />
          <a
            className="pol-foot-link"
            style={{ color: accent }}
            href={`https://testnet.snowtrace.io/address/${
              isPrivate
                ? contractAddresses.identityRegistry
                : contractAddresses.orderbook
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ver en Snowtrace<span className="link-arrow">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
