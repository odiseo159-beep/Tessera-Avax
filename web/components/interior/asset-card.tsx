"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { AssetPriceCell } from "./asset-price-cell";
import { Sparkline } from "@/components/landing/sparkline";
import { fmtPct } from "@/components/landing/landing-data";
import { useLivePrice } from "@/hooks/use-live-price";
import type { CompanyMeta } from "@/lib/mock-companies";

interface AssetCardProps {
  company: CompanyMeta;
}

export function AssetCard({ company }: AssetCardProps) {
  const accent = company.universe === "private" ? "#0F6E56" : "#3C3489";
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  const onMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }, []);

  const live = useLivePrice(company);
  const positive = live.change24h >= 0;
  const ordersCount = 4; // 4 seeded orders per token in `deploy-public.ts`; private has 6 — close enough as headline.
  const seed = company.symbol.charCodeAt(0) * 7 + (company.symbol.charCodeAt(1) ?? 0);

  return (
    <Link
      ref={ref}
      href={`/${company.universe}/trade/${company.slug}`}
      className={`asset-card asset-card--${company.universe}`}
      onMouseMove={onMove}
      style={{
        ["--accent" as string]: accent,
        ["--mx" as string]: `${mouse.x}%`,
        ["--my" as string]: `${mouse.y}%`,
      }}
    >
      <span className="asset-cursor-glow" aria-hidden="true" />
      <div className="asset-head">
        {company.universe === "public" && company.dinariLogoUrl ? (
          <span className="asset-logo" style={{ background: "#FFFFFF", color: "#1A1D21", padding: 0 }}>
            <Image
              src={company.dinariLogoUrl}
              alt={`${company.name} logo`}
              width={28}
              height={28}
              unoptimized
            />
          </span>
        ) : (
          <span className="asset-logo" style={{ background: company.logoBg, color: company.logoColor }}>
            {company.symbol.slice(0, 2)}
          </span>
        )}
        <div className="asset-id">
          <span className="asset-sym">
            {company.symbol}
            <span className="asset-chip">{company.country}</span>
          </span>
          <span className="asset-name">
            {company.name} · {company.sector}
            {company.round ? ` · ${company.round}` : ""}
          </span>
        </div>
      </div>

      <div className="asset-body">
        <div>
          <AssetPriceCell
            anchor={company.midPriceUsdc}
            livePrice={live.source !== "mock" ? live.priceUsdc : undefined}
            className="asset-price-lg"
            vol={0.0009}
            intervalMs={2200 + (company.symbol.charCodeAt(0) % 5) * 220}
          />
          <div className={`asset-change ${positive ? "is-up" : "is-down"}`}>
            {fmtPct(live.change24h / 100)} <span style={{ color: "var(--fg-faint)" }}>· 24h</span>
          </div>
        </div>
        <span className="asset-spark">
          <Sparkline color={accent} seed={seed} w={88} h={28} />
        </span>
      </div>

      <div className="asset-meta-row">
        <span className="open-tag">
          <b>{ordersCount}+</b> órdenes en orderbook
        </span>
        <span className="mono">{live.source === "dinari" ? "Dinari live" : live.source === "onchain" ? "on-chain" : "mock"}</span>
      </div>
    </Link>
  );
}
