"use client";

import { useLivePriceMock } from "./use-live-price-mock";
import {
  PRIVATE_ASSETS,
  PUBLIC_ASSETS,
  fmtPrice,
  fmtPct,
  type LandingAsset,
} from "./landing-data";

interface TickerItemProps {
  a: LandingAsset;
  universe: "private" | "public";
  intervalMs: number;
}

function TickerItem({ a, universe, intervalMs }: TickerItemProps) {
  const { price, tick } = useLivePriceMock(a.price, 0.0009, intervalMs);
  return (
    <div className={`ticker-item ticker-item--${universe}`}>
      <span className={`tick-dot tick-dot--${universe}`} />
      <span className="tick-sym">{a.sym}</span>
      <span className="tick-price" data-tick={tick % 2}>
        ${fmtPrice(price)}
      </span>
      <span className={`tick-pct ${a.change >= 0 ? "is-up" : "is-down"}`}>
        {fmtPct(a.change)}
      </span>
      <span className="tick-sep" />
    </div>
  );
}

interface TickerTapeProps {
  style?: "scroll" | "static";
}

export function TickerTape({ style = "scroll" }: TickerTapeProps) {
  const allItems: Array<{ a: LandingAsset; universe: "private" | "public" }> = [
    ...PRIVATE_ASSETS.map((a) => ({ a, universe: "private" as const })),
    ...PUBLIC_ASSETS.map((a) => ({ a, universe: "public" as const })),
  ];
  // duplicate stream so the CSS marquee can loop seamlessly
  const stream = [...allItems, ...allItems];

  return (
    <div className="ticker-tape" data-style={style}>
      <div className="ticker-edge ticker-edge--l" aria-hidden="true" />
      <div className="ticker-edge ticker-edge--r" aria-hidden="true" />
      <div className="ticker-track">
        {stream.map((it, i) => (
          <TickerItem
            key={`${it.universe}-${it.a.sym}-${i}`}
            a={it.a}
            universe={it.universe}
            intervalMs={2400 + ((it.a.sym.charCodeAt(0) * 37) % 1200)}
          />
        ))}
      </div>
    </div>
  );
}
