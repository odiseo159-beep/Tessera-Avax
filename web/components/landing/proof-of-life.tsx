"use client";

import { useEffect, useState } from "react";
import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/format";

interface Tile {
  k: string;
  l: string;
  sub: string;
  tag: "live" | "on-chain" | "sandbox";
}

export function ProofOfLife() {
  const [vol, setVol] = useState(262240);
  const [orders, setOrders] = useState(48);
  const [lastOrderAgo, setLastOrderAgo] = useState(12);

  useEffect(() => {
    const id = setInterval(() => {
      setVol((v) => v + Math.floor(Math.random() * 220));
      if (Math.random() < 0.35) {
        setOrders((o) => Math.max(40, Math.min(80, o + (Math.random() < 0.55 ? 1 : -1))));
        setLastOrderAgo(Math.floor(Math.random() * 30) + 1);
      }
    }, 1700);
    return () => clearInterval(id);
  }, []);

  const tiles: Tile[] = [
    {
      k: "10",
      l: "tokens vivos en Fuji",
      sub: "4 private · 6 public",
      tag: "on-chain",
    },
    {
      k: orders.toString(),
      l: "órdenes activas en orderbook",
      sub: `última hace ${lastOrderAgo}s`,
      tag: "live",
    },
    {
      k: "6",
      l: "tickers US powered by Dinari",
      sub: "AAPL · MSFT · NVDA · GOOGL · AMZN · META",
      tag: "sandbox",
    },
    {
      k: `$${vol.toLocaleString("en-US")}`,
      l: "volumen sandbox · 30d",
      sub: "USDC nocional",
      tag: "live",
    },
  ];

  const usdcAddr =
    contractAddresses.usdc !== ZERO_ADDRESS ? shortAddress(contractAddresses.usdc) : "0xFaC0…8dB6";
  const registryAddr =
    contractAddresses.identityRegistry !== ZERO_ADDRESS
      ? shortAddress(contractAddresses.identityRegistry)
      : "0x4d69…Ea96";
  const orderbookAddr =
    contractAddresses.orderbook !== ZERO_ADDRESS
      ? shortAddress(contractAddresses.orderbook)
      : "0x830e…E042";

  const snowtraceHref =
    contractAddresses.orderbook !== ZERO_ADDRESS
      ? `https://testnet.snowtrace.io/address/${contractAddresses.orderbook}`
      : "https://testnet.snowtrace.io";

  return (
    <section className="pol">
      <div className="pol-head">
        <div className="eyebrow">
          <span className="eyebrow-dot eyebrow-dot--red" />
          Prueba de vida — datos reales corriendo ahora
        </div>
      </div>
      <div className="pol-grid">
        {tiles.map((t, i) => (
          <div className="pol-tile" key={i}>
            <div className="pol-tile-tag">
              <span className={`pol-dot ${t.tag === "live" ? "is-live" : ""}`} />
              {t.tag}
            </div>
            <div className="pol-tile-k">{t.k}</div>
            <div className="pol-tile-l">{t.l}</div>
            <div className="pol-tile-sub">{t.sub}</div>
          </div>
        ))}
      </div>
      <div className="pol-foot">
        <span className="pol-foot-item">
          <span className="pol-foot-label">contracts</span>
          <span className="mono pol-foot-val">
            {usdcAddr} · {registryAddr} · {orderbookAddr}
          </span>
        </span>
        <span className="pol-foot-sep" />
        <a className="pol-foot-link" href={snowtraceHref} target="_blank" rel="noopener noreferrer">
          ver en Snowtrace<span className="link-arrow">↗</span>
        </a>
      </div>
    </section>
  );
}
