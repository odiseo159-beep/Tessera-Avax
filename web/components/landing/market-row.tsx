"use client";

import { useEffect, useState } from "react";
import { useLivePriceMock } from "./use-live-price-mock";
import { Sparkline } from "./sparkline";
import { fmtPct, fmtPrice, type LandingAsset } from "./landing-data";

interface MarketRowProps {
  a: LandingAsset;
  accent: string;
}

export function MarketRow({ a, accent }: MarketRowProps) {
  const intervalMs = 2200 + (a.sym.charCodeAt(0) % 5) * 220;
  const { price, tick, dir } = useLivePriceMock(a.price, 0.0008, intervalMs);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    setFlash(dir > 0 ? 1 : dir < 0 ? -1 : 0);
    const id = setTimeout(() => setFlash(0), 500);
    return () => clearTimeout(id);
    // re-run only when a new tick lands
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const sparkSeed = a.sym.charCodeAt(0) * 7 + (a.sym.charCodeAt(1) ?? 0);

  return (
    <div className="mkt-row">
      <span className="mkt-logo" style={{ background: a.logoBg, color: a.logoFg }}>
        {a.sym.slice(0, 2)}
      </span>
      <span className="mkt-sym">{a.sym}</span>
      <span className="mkt-name">{a.name}</span>
      <span
        className={`mkt-price ${
          flash === 1 ? "is-flash-up" : flash === -1 ? "is-flash-down" : ""
        }`}
        style={{ ["--accent" as string]: accent }}
      >
        ${fmtPrice(price)}
      </span>
      <span className={`mkt-pct ${a.change >= 0 ? "is-up" : "is-down"}`}>
        {fmtPct(a.change)}
      </span>
      <span className="mkt-spark">
        <Sparkline color={accent} seed={sparkSeed} w={64} h={20} />
      </span>
    </div>
  );
}
