"use client";

import { useCallback, useRef, useState } from "react";
import { MarketRow } from "./market-row";
import type { LandingAsset } from "./landing-data";

export interface MarketStat {
  label: string;
  val: string;
}

interface MarketCardProps {
  universe: "private" | "public";
  assets: LandingAsset[];
  accent: string;
  eyebrow: string;
  title: string;
  sub: string;
  stats: MarketStat[];
  contractShort: string;
  hoveredUniverse: "private" | "public" | null;
  onHoverChange: (u: "private" | "public" | null) => void;
  tilt: boolean;
  onEnter: () => void;
}

export function MarketCard({
  universe,
  assets,
  accent,
  eyebrow,
  title,
  sub,
  stats,
  contractShort,
  onHoverChange,
  hoveredUniverse,
  tilt,
  onEnter,
}: MarketCardProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const onMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }, []);

  const otherActive = hoveredUniverse !== null && hoveredUniverse !== universe;
  const tiltX = tilt && hovering ? (50 - mouse.y) * 0.06 : 0;
  const tiltY = tilt && hovering ? (mouse.x - 50) * 0.06 : 0;

  return (
    <button
      ref={ref}
      type="button"
      className={`market-card market-card--${universe} ${
        hovering ? "is-hover" : ""
      } ${otherActive ? "is-dim" : ""} ${pressed ? "is-pressed" : ""}`}
      onMouseMove={onMove}
      onMouseEnter={() => {
        setHovering(true);
        onHoverChange(universe);
      }}
      onMouseLeave={() => {
        setHovering(false);
        onHoverChange(null);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={onEnter}
      style={{
        ["--accent" as string]: accent,
        ["--mx" as string]: `${mouse.x}%`,
        ["--my" as string]: `${mouse.y}%`,
        ["--tx" as string]: `${tiltY}deg`,
        ["--ty" as string]: `${tiltX}deg`,
      }}
    >
      <span className="card-cursor-glow" aria-hidden="true" />
      <span className="card-border-glow" aria-hidden="true" />

      <span className="card-corner card-corner--tl" aria-hidden="true" />
      <span className="card-corner card-corner--tr" aria-hidden="true" />
      <span className="card-corner card-corner--bl" aria-hidden="true" />
      <span className="card-corner card-corner--br" aria-hidden="true" />

      <div className="card-head">
        <div className="card-eyebrow">
          <span className="card-eyebrow-dot" />
          {eyebrow}
        </div>
        <div className="card-meta-mono">
          <span className="card-meta-label">contract</span>
          <span className="card-meta-val">{contractShort}</span>
          <span className="card-meta-arrow" aria-hidden="true">↗</span>
        </div>
      </div>

      <div className="card-title-row">
        <h2 className="card-title">{title}</h2>
        <span className="card-arrow" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M5 11h12M12 6l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <p className="card-sub">{sub}</p>

      <div className="card-stats">
        {stats.map((s) => (
          <div className="card-stat" key={s.label}>
            <span className="card-stat-val">{s.val}</span>
            <span className="card-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card-divider" />

      <div className="mkt-list">
        <div className="mkt-list-head">
          <span>Símbolo</span>
          <span />
          <span />
          <span>Precio</span>
          <span>24h</span>
          <span>30d</span>
        </div>
        {assets.slice(0, 4).map((a) => (
          <MarketRow key={a.sym} a={a} accent={accent} />
        ))}
      </div>

      <div className="card-foot">
        <span className="card-foot-cta">
          {universe === "private" ? "Entrar a Private" : "Entrar a Public"}
          <span className="card-foot-arrow" aria-hidden="true">→</span>
        </span>
        <span className="card-foot-meta">
          <span className="card-foot-dot" />
          {universe === "private" ? "Orderbook on-chain" : "Powered by Dinari"}
        </span>
      </div>
    </button>
  );
}
