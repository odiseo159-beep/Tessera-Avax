"use client";

import { useEffect, useRef, useState } from "react";
import { MarketCard, type MarketStat } from "./market-card";
import { PRIVATE_ASSETS, PUBLIC_ASSETS } from "./landing-data";
import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/format";

interface ChooseMarketProps {
  tilt: boolean;
  showConnector: boolean;
  onEnter: (u: "private" | "public") => void;
}

const PRIVATE_STATS: MarketStat[] = [
  { label: "Tokens", val: "4" },
  { label: "Órdenes seedeadas", val: "24" },
  { label: "Compliance", val: "ERC-3643" },
];

const PUBLIC_STATS: MarketStat[] = [
  { label: "Tickers", val: "6" },
  { label: "Órdenes seedeadas", val: "24" },
  { label: "Datos vía", val: "Dinari live" },
];

export function ChooseMarket({ tilt, showConnector, onEnter }: ChooseMarketProps) {
  const [hovered, setHovered] = useState<"private" | "public" | null>(null);
  const wrapRef = useRef<HTMLElement | null>(null);
  const [bridge, setBridge] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const xCent = 1 - Math.abs(x - 0.5) * 2;
      const yBand = y > 0.05 && y < 0.95 ? 1 : 0;
      setBridge(Math.max(0, Math.min(1, xCent * yBand)));
    };
    const onLeave = () => setBridge(0);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const orderbookShort =
    contractAddresses.orderbook !== ZERO_ADDRESS
      ? shortAddress(contractAddresses.orderbook)
      : "0x830e…E042";

  return (
    <section className="choose" ref={wrapRef} data-hovered={hovered ?? "none"}>
      <header className="choose-head">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Elige un universo
        </div>
        <h2 className="choose-title">Misma wallet. Misma identidad. Dos mercados.</h2>
        <p className="choose-sub">
          Verifica KYC una sola vez en <span className="mono">IdentityRegistry</span>.
          Cumples ERC-3643 en LatAm privado y en US público — sin re-onboard.
        </p>
      </header>

      <div className="choose-grid">
        <MarketCard
          universe="private"
          assets={PRIVATE_ASSETS}
          accent="#0F6E56"
          eyebrow="Tessera Private · LatAm equity"
          title="Empresas privadas de LatAm"
          sub="Kavak, Bitso, Clip y SPVs de Arkangeles tokenizadas como SecurityTokens. Compliance enforced en _update."
          stats={PRIVATE_STATS}
          contractShort={orderbookShort}
          onHoverChange={setHovered}
          hoveredUniverse={hovered}
          tilt={tilt}
          onEnter={() => onEnter("private")}
        />

        {showConnector && (
          <div
            className="connector"
            style={{ ["--bridge" as string]: bridge }}
            aria-hidden="true"
          >
            <div className="connector-line" />
            <div className="connector-node connector-node--l" />
            <div className="connector-node connector-node--r" />
            <div className="connector-glow" />
            <div className="connector-label">
              <span className="connector-label-dot connector-label-dot--g" />
              una identidad
              <span className="connector-label-dot connector-label-dot--p" />
            </div>
          </div>
        )}

        <MarketCard
          universe="public"
          assets={PUBLIC_ASSETS}
          accent="#3C3489"
          eyebrow="Tessera Public · US equity"
          title="Stocks públicos US"
          sub="Mega-caps con precios y metadata en vivo desde el sandbox de Dinari. Secundario sobre el mismo orderbook."
          stats={PUBLIC_STATS}
          contractShort={orderbookShort}
          onHoverChange={setHovered}
          hoveredUniverse={hovered}
          tilt={tilt}
          onEnter={() => onEnter("public")}
        />
      </div>
    </section>
  );
}
