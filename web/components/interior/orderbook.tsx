"use client";

import { useMemo } from "react";
import { useOrders, groupOrderbook } from "@/hooks/use-orders";
import type { CompanyMeta } from "@/lib/mock-companies";
import type { Address } from "@/lib/contracts";

interface OrderbookProps {
  company: CompanyMeta;
  tokenAddress: Address;
  accent: string;
  rows?: number;
  onLevelClick?: (price: number, isBuy: boolean) => void;
}

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

function priceToDollars(p: bigint): number {
  return Number(p) / Number(USDC_UNIT);
}
function amountToTokens(a: bigint): number {
  return Number(a) / Number(TOKEN_UNIT);
}
function fmtPrice(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtQty(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

export function Orderbook({ company, tokenAddress, accent, rows = 9, onLevelClick }: OrderbookProps) {
  const { orders, fromChain } = useOrders(company, tokenAddress);

  const { bids, asks, spread, mid } = useMemo(() => {
    const grouped = groupOrderbook(orders);
    const bidLevels = grouped.bids.slice(0, rows).map((l) => ({
      p: priceToDollars(l.price),
      s: amountToTokens(l.amount),
    }));
    const askLevels = grouped.asks.slice(0, rows).map((l) => ({
      p: priceToDollars(l.price),
      s: amountToTokens(l.amount),
    }));
    const maxSize = Math.max(
      ...bidLevels.map((l) => l.s),
      ...askLevels.map((l) => l.s),
      0.0001
    );
    const annot = (arr: typeof bidLevels) => {
      let run = 0;
      return arr.map((l) => {
        run += l.s;
        return { ...l, t: run, depth: l.s / maxSize };
      });
    };
    const bestBid = bidLevels[0]?.p ?? null;
    const bestAsk = askLevels[0]?.p ?? null;
    const sp = bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;
    const m = bestBid !== null && bestAsk !== null ? (bestAsk + bestBid) / 2 : null;
    return {
      bids: annot(bidLevels),
      asks: annot(askLevels),
      spread: sp,
      mid: m,
    };
  }, [orders, rows]);

  const totalLevels = bids.length + asks.length;
  const shadow =
    company.universe === "private"
      ? "0 0 0 3px rgba(15,110,86,0.16)"
      : "0 0 0 3px rgba(60,52,137,0.16)";

  return (
    <div className="ob-card">
      <div className="ob-head">
        <span className="ob-h">
          <span
            className="pol-dot is-live"
            style={{ background: accent, boxShadow: shadow }}
          />
          Orderbook
        </span>
        <span className="ob-meta">
          {fromChain ? "L2" : "mock"} · {totalLevels} niveles
        </span>
      </div>
      <div className="ob-col-head">
        <span>Precio</span>
        <span>Tamaño</span>
        <span>Total</span>
      </div>

      {/* asks reversed so best ask sits closest to spread */}
      {[...asks].reverse().map((r, i) => (
        <div
          key={`a${i}`}
          className="ob-row is-ask"
          onClick={onLevelClick ? () => onLevelClick(r.p, true) : undefined}
          role={onLevelClick ? "button" : undefined}
          style={onLevelClick ? { cursor: "pointer" } : undefined}
        >
          <span className="ob-depth" style={{ width: `${r.depth * 100}%` }} />
          <span>${fmtPrice(r.p)}</span>
          <span>{fmtQty(r.s)}</span>
          <span>{fmtQty(r.t)}</span>
        </div>
      ))}

      <div className="ob-spread">
        <span className="ob-spread-tag">spread</span>
        <span className="price">${fmtPrice(mid ?? 0)}</span>
        <span className="mono">
          {spread !== null && mid !== null
            ? `$${spread.toFixed(2)} · ${((spread / mid) * 100).toFixed(2)}%`
            : "—"}
        </span>
      </div>

      {bids.map((r, i) => (
        <div
          key={`b${i}`}
          className="ob-row is-bid"
          onClick={onLevelClick ? () => onLevelClick(r.p, false) : undefined}
          role={onLevelClick ? "button" : undefined}
          style={onLevelClick ? { cursor: "pointer" } : undefined}
        >
          <span className="ob-depth" style={{ width: `${r.depth * 100}%` }} />
          <span>${fmtPrice(r.p)}</span>
          <span>{fmtQty(r.s)}</span>
          <span>{fmtQty(r.t)}</span>
        </div>
      ))}
    </div>
  );
}
