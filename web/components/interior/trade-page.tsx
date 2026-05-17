"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Breadcrumb } from "./breadcrumb";
import { Orderbook } from "./orderbook";
import { TradePanel } from "./trade-panel";
import { PriceChart, type Timespan } from "./price-chart";
import { AssetPriceCell } from "./asset-price-cell";
import { useLivePrice } from "@/hooks/use-live-price";
import { useDinariHistory } from "@/hooks/use-dinari-price";
import {
  contractAddresses,
  tokenAddressOf,
  ZERO_ADDRESS,
} from "@/lib/contracts";
import { shortAddress } from "@/lib/format";
import type { CompanyMeta } from "@/lib/mock-companies";

type DinariTimespan = "DAY" | "WEEK" | "MONTH" | "YEAR";

function toDinariTs(ts: Timespan): DinariTimespan {
  if (ts === "1D") return "DAY";
  if (ts === "1W") return "WEEK";
  if (ts === "1Y") return "YEAR";
  return "MONTH";
}

function ptsLabel(ts: Timespan): string {
  if (ts === "1D") return "96 puntos · 15 min";
  if (ts === "1W") return "168 puntos · 1 h";
  if (ts === "1M") return "120 puntos · 6 h";
  if (ts === "1Y") return "200 puntos · 1 día";
  return "histórico completo";
}

interface TradePageProps {
  company: CompanyMeta;
}

export function TradePage({ company }: TradePageProps) {
  const isPrivate = company.universe === "private";
  const accent = isPrivate ? "#0F6E56" : "#3C3489";
  const shadow = isPrivate
    ? "0 0 0 3px rgba(15,110,86,0.16)"
    : "0 0 0 3px rgba(60,52,137,0.16)";
  const tokenAddress = tokenAddressOf(company.symbol);

  const [timespan, setTimespan] = useState<Timespan>("1M");
  const [prefill, setPrefill] = useState<{ price: number; isBuy: boolean } | null>(null);

  const live = useLivePrice(company);

  // Dinari historical only for public side
  const history = useDinariHistory(
    isPrivate ? undefined : company.dinariStockId,
    toDinariTs(timespan)
  );

  const chartData = useMemo(() => {
    if (isPrivate) return undefined; // PriceChart falls back to deterministic walk
    if (!history.data || history.data.length === 0) return undefined;
    return history.data.map((p) => p.value);
  }, [isPrivate, history.data]);

  // Reset prefill if it becomes stale (e.g., on company switch)
  useEffect(() => {
    setPrefill(null);
  }, [company.symbol]);

  const orderbookShort =
    contractAddresses.orderbook !== ZERO_ADDRESS
      ? shortAddress(contractAddresses.orderbook)
      : "0x830e…E042";
  const tokenShort =
    tokenAddress !== ZERO_ADDRESS ? shortAddress(tokenAddress) : "0x…";

  const change24h = live.change24h;
  const positive = change24h >= 0;

  const stats: Array<{ tag: string; k: string; sub: string; live?: boolean }> = isPrivate
    ? [
        {
          tag: "on-chain · 24h",
          k: `${positive ? "+" : ""}${change24h.toFixed(2)}%`,
          sub: "delta de fills",
          live: true,
        },
        {
          tag: "vol. 24h",
          k: `$${(company.volume24hUsdc / 1000).toFixed(1)}K`,
          sub: "USDC nocional",
          live: false,
        },
        {
          tag: "market cap",
          k: `$${(company.marketCapUsdc / 1_000_000).toFixed(1)}M`,
          sub: `${company.holders.toLocaleString("en-US")} holders`,
          live: false,
        },
        {
          tag: "ronda",
          k: company.round,
          sub: `${company.country} · ${company.sector}`,
          live: false,
        },
      ]
    : [
        {
          tag: "Dinari · 24h",
          k: `${positive ? "+" : ""}${change24h.toFixed(2)}%`,
          sub: "live feed",
          live: true,
        },
        {
          tag: "vol. 24h",
          k: `$${(company.volume24hUsdc / 1_000_000).toFixed(1)}M`,
          sub: "USDC nocional",
          live: false,
        },
        {
          tag: "market cap",
          k: `$${(company.marketCapUsdc / 1_000_000_000_000).toFixed(2)}T`,
          sub: company.sector,
          live: false,
        },
        {
          tag: "sector",
          k: company.sector,
          sub: "NASDAQ",
          live: false,
        },
      ];

  const seedKey = company.symbol.charCodeAt(0) * 11 + (company.symbol.charCodeAt(1) ?? 0);

  return (
    <div className="page">
      <div className="page-inner page-wide">
        <Breadcrumb universe={company.universe} symbol={company.symbol} />

        <header className="trade-header">
          <div className="trade-id">
            {company.universe === "public" && company.dinariLogoUrl ? (
              <span
                className="trade-logo"
                style={{ background: "#fff", padding: 8 }}
              >
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
                className="trade-logo"
                style={{ background: company.logoBg, color: company.logoColor }}
              >
                {company.symbol.slice(0, 2)}
              </span>
            )}
            <div className="trade-name">
              <div className="trade-name-top">
                <span>{company.name}</span>
                <span className="trade-sym">{company.symbol}</span>
                <span
                  className={`badge ${
                    isPrivate ? "badge--private" : "badge--public"
                  }`}
                >
                  {isPrivate ? "ERC-3643" : "Dinari sandbox"}
                </span>
                <span className="badge">
                  <span
                    className="pol-dot is-live"
                    style={{ marginRight: 4 }}
                  />
                  KYC enforced
                </span>
              </div>
              <div className="trade-name-meta">
                <span>{company.sector}</span>
                <span className="dot" />
                {isPrivate && (
                  <>
                    <span>{company.round}</span>
                    <span className="dot" />
                  </>
                )}
                <span>{company.country}</span>
                <span className="dot" />
                <span
                  className="mono"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--fg-faint)",
                  }}
                >
                  token {tokenShort}
                </span>
              </div>
            </div>
          </div>
          <div className="trade-price-block">
            <AssetPriceCell
              anchor={live.priceUsdc}
              livePrice={live.source !== "mock" ? live.priceUsdc : undefined}
              className="trade-price"
            />
            <span
              className={`trade-change-pill ${positive ? "is-up" : "is-down"}`}
            >
              <span className="pct-arrow">{positive ? "▲" : "▼"}</span>
              {`${positive ? "+" : ""}${change24h.toFixed(2)}%`}{" "}
              <span style={{ color: "var(--fg-faint)" }}>· 24h</span>
            </span>
          </div>
        </header>

        <div className="trade-stats">
          {stats.map((s, i) => (
            <div key={i} className="trade-stat">
              <span className="trade-stat-tag">
                <span className={`pol-dot ${s.live ? "is-live" : ""}`} />
                {s.tag}
              </span>
              <span className="trade-stat-k">{s.k}</span>
              <span className="trade-stat-sub">{s.sub}</span>
            </div>
          ))}
        </div>

        <div className="trade-grid">
          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-head-l">
                <span className="chart-title">Precio</span>
                <span className="chart-meta">
                  {isPrivate ? "deterministic mock · " : "Dinari historical · "}
                  {timespan}
                </span>
              </div>
              <div className="chart-tabs" role="tablist">
                {(isPrivate
                  ? (["1W", "1M", "ALL"] as const)
                  : (["1D", "1W", "1M", "1Y"] as const)
                ).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`chart-tab ${timespan === t ? "is-active" : ""}`}
                    onClick={() => setTimespan(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <PriceChart
              accent={accent}
              anchor={live.priceUsdc}
              seed={seedKey}
              timespan={timespan}
              data={chartData}
            />
            <div className="chart-foot">
              <span>
                <span
                  className="pol-dot is-live"
                  style={{ background: accent, boxShadow: shadow, marginRight: 6 }}
                />
                {isPrivate ? "actualiza al fill" : "Dinari · cada 30s"}
              </span>
              <span>
                {ptsLabel(timespan)} · {company.symbol} → USDC
              </span>
            </div>
          </div>

          <div className="right-col">
            <Orderbook
              company={company}
              tokenAddress={tokenAddress}
              accent={accent}
              rows={9}
              onLevelClick={(p, isBuy) => setPrefill({ price: p, isBuy })}
            />
            <TradePanel
              company={company}
              tokenAddress={tokenAddress}
              anchor={live.priceUsdc}
              prefill={prefill}
              onSubmitted={() => setPrefill(null)}
            />
          </div>
        </div>

        <div
          className="pol-foot"
          style={{ marginTop: 36, marginLeft: 0, marginRight: 0 }}
        >
          <span className="pol-foot-item">
            <span className="pol-foot-label">orderbook</span>
            <span className="mono pol-foot-val">{orderbookShort}</span>
          </span>
          <span className="pol-foot-sep" />
          <a
            className="pol-foot-link"
            style={{ color: accent }}
            href={`https://testnet.snowtrace.io/address/${contractAddresses.orderbook}`}
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
