"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Sparkline } from "@/components/landing/sparkline";
import { Toast } from "./toast";
import { useUserBalances } from "@/hooks/use-user-balances";
import { useUserActiveOrders } from "@/hooks/use-user-orders";
import { useTradeHistory } from "@/hooks/use-trade-history";
import { useCancelOrder } from "@/hooks/use-cancel-order";
import { useMintUsdc } from "@/hooks/use-mint-usdc";
import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/format";
import { companyBySymbol } from "@/lib/mock-companies";

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(2)}%`;
}
function fmtQty(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
function shortHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const balances = useUserBalances();
  const activeOrders = useUserActiveOrders();
  const history = useTradeHistory();
  const cancel = useCancelOrder();
  const mint = useMintUsdc();
  const [toastOn, setToastOn] = useState(false);

  const { data: usdcBalance } = useBalance({
    address,
    token: contractAddresses.usdc !== ZERO_ADDRESS ? contractAddresses.usdc : undefined,
    query: { enabled: isConnected && contractAddresses.usdc !== ZERO_ADDRESS },
  });

  const usdcAvailable = usdcBalance ? Number(usdcBalance.value) / Number(USDC_UNIT) : 0;

  const holdings = useMemo(() => {
    return balances.tokens
      .filter((t) => t.amount > 0n)
      .map((t) => {
        const company = companyBySymbol(t.symbol);
        const qty = Number(t.amount) / Number(TOKEN_UNIT);
        const last = company.midPriceUsdc;
        const avg = company.midPriceUsdc * 0.95; // we don't track cost basis on-chain; show 5% below as illustrative
        const mv = qty * last;
        const cost = qty * avg;
        const pnl = mv - cost;
        const pct = cost > 0 ? pnl / cost : 0;
        return {
          symbol: t.symbol,
          name: company.name,
          universe: company.universe,
          logoBg: company.logoBg,
          logoFg: "#fff",
          qty,
          avg,
          last,
          mv,
          cost,
          pnl,
          pct,
        };
      });
  }, [balances.tokens]);

  const totals = useMemo(() => {
    let mv = 0;
    let cost = 0;
    holdings.forEach((h) => {
      mv += h.mv;
      cost += h.cost;
    });
    const pnl = mv - cost;
    const pct = cost > 0 ? pnl / cost : 0;
    return { mv, cost, pnl, pct };
  }, [holdings]);

  const total = usdcAvailable + totals.mv;

  const copyAddr = () => {
    if (!address) return;
    try {
      navigator.clipboard?.writeText(address);
      setToastOn(true);
      setTimeout(() => setToastOn(false), 1300);
    } catch {
      /* clipboard might be blocked; toast just doesn't appear */
    }
  };

  if (!isConnected) {
    return (
      <div className="page">
        <div className="page-inner" style={{ maxWidth: 720 }}>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Portfolio
          </div>
          <h1 className="ph-h1">Conecta tu wallet para ver tus holdings.</h1>
          <p className="ph-lede">
            El portfolio se construye desde tus balances on-chain y los eventos
            de fill del orderbook.
          </p>
          <div style={{ marginTop: 16 }}>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-inner page-wide">
        <div className="pf-summary">
          <div className="pf-addr">
            <span className="pf-addr-tag">wallet</span>
            <span
              className="pf-addr-val"
              onClick={copyAddr}
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              {address ? shortAddress(address) : "—"}
              <span className="pf-copy" aria-label="copy">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M8 8h11v11H8z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5 5h11v3M5 5v11h3" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
            </span>
            <span className="pf-addr-net">
              <span
                className="pol-dot is-live"
                style={{
                  background: "var(--positive)",
                  boxShadow: "0 0 0 3px rgba(15,110,86,0.16)",
                }}
              />{" "}
              Avalanche Fuji · ERC-3643
            </span>
          </div>
          <div className="pf-balance">
            <span className="ph-stat-tag" style={{ color: "var(--fg-faint)" }}>
              <span className="pol-dot" /> equity total
            </span>
            <span className="pf-balance-k">${fmtUsd(total)}</span>
            <span className="pf-balance-sub">
              <span>${fmtUsd(usdcAvailable)} USDC</span>
              <span>·</span>
              <span>${fmtUsd(totals.mv)} en posiciones</span>
              <span>·</span>
              <span className={`pct ${totals.pnl >= 0 ? "is-up" : "is-down"}`}>
                {totals.pnl >= 0 ? "+" : ""}${fmtUsd(totals.pnl)} · {fmtPct(totals.pct)}
              </span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => mint.mint()}
            disabled={mint.state === "minting"}
          >
            {mint.state === "minting" ? "Minteando…" : "Reclamar 10k USDC mock"}
          </button>
          <Link className="btn" href="/private">
            Explorar Private
          </Link>
          <Link className="btn" href="/public">
            Explorar Public
          </Link>
        </div>

        {/* HOLDINGS */}
        <div className="section-head">
          <h2 className="section-h2">Posiciones</h2>
          <span className="section-meta">
            <span className="pol-dot" style={{ background: "var(--primary)" }} />
            <span>
              {holdings.filter((h) => h.universe === "private").length} private
            </span>
            <span>·</span>
            <span className="pol-dot" style={{ background: "var(--accent)" }} />
            <span>
              {holdings.filter((h) => h.universe === "public").length} public
            </span>
          </span>
        </div>

        <div className="tbl-card tbl-holdings">
          <div className="tbl-head">
            <span>Activo</span>
            <span>Cantidad</span>
            <span>Precio promedio</span>
            <span className="col-hide">Precio actual</span>
            <span>PnL</span>
            <span style={{ textAlign: "right" }}>30 d</span>
          </div>
          {balances.isLoading && holdings.length === 0 && (
            <div className="tbl-empty">
              <span className="ico">$</span>
              <span>Cargando posiciones…</span>
            </div>
          )}
          {!balances.isLoading && holdings.length === 0 && (
            <div className="tbl-empty">
              <span className="ico">$</span>
              <span>Aún no tienes posiciones</span>
              <Link className="cta" href="/private">
                Explorar Private<span className="link-arrow">→</span>
              </Link>
            </div>
          )}
          {holdings.map((h) => {
            const accent = h.universe === "private" ? "#0F6E56" : "#3C3489";
            const seed = h.symbol.charCodeAt(0) * 13 + 7;
            return (
              <div key={h.symbol} className={`tbl-row is-${h.universe}`}>
                <div className="tbl-asset">
                  <span className="logo" style={{ background: h.logoBg, color: h.logoFg }}>
                    {h.symbol.slice(0, 2)}
                  </span>
                  <div className="nm">
                    <span className="sym">
                      {h.symbol}{" "}
                      <span
                        className={`badge ${
                          h.universe === "private" ? "badge--private" : "badge--public"
                        }`}
                        style={{ marginLeft: 6, fontSize: 9, padding: "1px 5px" }}
                      >
                        {h.universe}
                      </span>
                    </span>
                    <span className="sub">{h.name}</span>
                  </div>
                </div>
                <span className="tbl-num">
                  {fmtQty(h.qty)} <span style={{ color: "var(--fg-faint)" }}>{h.symbol}</span>
                </span>
                <span className="tbl-num">${fmtUsd(h.avg)}</span>
                <span className="tbl-num col-hide">${fmtUsd(h.last)}</span>
                <span className={`tbl-num ${h.pnl >= 0 ? "is-up" : "is-down"}`}>
                  {h.pnl >= 0 ? "+" : ""}${fmtUsd(h.pnl)}
                  <span style={{ marginLeft: 6, fontSize: 11.5, opacity: 0.78 }}>
                    {fmtPct(h.pct)}
                  </span>
                </span>
                <span
                  className="tbl-spark"
                  style={{ justifyContent: "flex-end", display: "inline-flex" }}
                >
                  <Sparkline color={accent} seed={seed} w={100} h={22} />
                </span>
              </div>
            );
          })}
        </div>

        {/* ACTIVE ORDERS */}
        <div className="section-head">
          <h2 className="section-h2">Órdenes activas</h2>
          <span className="section-meta">
            <span className="pol-dot is-live" />
            <span className="mono" style={{ fontFamily: "var(--font-mono)" }}>
              {activeOrders.orders.length} pendientes
            </span>
          </span>
        </div>

        <div className="tbl-card tbl-orders">
          <div className="tbl-head">
            <span>Side</span>
            <span>Activo</span>
            <span>Cantidad</span>
            <span>Precio</span>
            <span style={{ textAlign: "right" }}></span>
          </div>
          {activeOrders.isLoading && activeOrders.orders.length === 0 && (
            <div className="tbl-empty">
              <span className="ico">≡</span>
              <span>Cargando órdenes…</span>
            </div>
          )}
          {!activeOrders.isLoading && activeOrders.orders.length === 0 && (
            <div className="tbl-empty">
              <span className="ico">≡</span>
              <span>No tienes órdenes abiertas</span>
            </div>
          )}
          {activeOrders.orders.map((o) => {
            const company = companyBySymbol(o.symbol);
            const qty = Number(o.amount) / Number(TOKEN_UNIT);
            const price = Number(o.price) / Number(USDC_UNIT);
            const isCancelling = cancel.pendingId === o.id;
            return (
              <div key={o.id.toString()} className={`tbl-row is-${company.universe}`}>
                <span>
                  <span
                    className={`badge ${o.isBuy ? "badge--buy" : "badge--sell"}`}
                  >
                    {o.isBuy ? "BUY" : "SELL"} · limit
                  </span>
                </span>
                <div className="tbl-asset">
                  <span
                    className="logo"
                    style={{ background: company.logoBg, color: "#fff" }}
                  >
                    {o.symbol.slice(0, 2)}
                  </span>
                  <div className="nm">
                    <span className="sym">{o.symbol}</span>
                    <span className="sub">{company.name}</span>
                  </div>
                </div>
                <span className="tbl-num">
                  {fmtQty(qty)} {o.symbol}
                </span>
                <span className="tbl-num">${fmtUsd(price)}</span>
                <span style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="tbl-cancel"
                    onClick={() => cancel.cancel(o.id)}
                    disabled={isCancelling || cancel.state === "submitting"}
                  >
                    {isCancelling ? "Cancelando…" : "Cancelar"}
                  </button>
                </span>
              </div>
            );
          })}
        </div>

        {/* HISTORY */}
        <div className="section-head">
          <h2 className="section-h2">Historial</h2>
          <span className="section-meta">
            <span className="mono" style={{ fontFamily: "var(--font-mono)" }}>
              {history.entries.length} fills
            </span>
          </span>
        </div>

        <div className="tbl-card tbl-history">
          <div className="tbl-head">
            <span>Side</span>
            <span>Activo</span>
            <span>Cantidad · Precio</span>
            <span>Total</span>
            <span className="col-hide">Contraparte</span>
            <span className="col-hide" style={{ textAlign: "right" }}>
              Tx
            </span>
          </div>
          {history.isLoading && history.entries.length === 0 && (
            <div className="tbl-empty">
              <span className="ico">≡</span>
              <span>Cargando historial…</span>
            </div>
          )}
          {!history.isLoading && history.entries.length === 0 && (
            <div className="tbl-empty">
              <span className="ico">≡</span>
              <span>Aún no tienes trades. Cuando una orden se ejecute, aparece aquí.</span>
            </div>
          )}
          {history.entries.map((e) => {
            const company = e.symbol !== "?" ? companyBySymbol(e.symbol) : null;
            const qty = Number(e.amount) / Number(TOKEN_UNIT);
            const total = Number(e.totalUsdc) / Number(USDC_UNIT);
            const price = qty > 0 ? total / qty : 0;
            return (
              <div
                key={`${e.txHash}-${e.orderId.toString()}`}
                className={`tbl-row is-${company?.universe ?? "private"}`}
              >
                <span>
                  <span
                    className={`badge ${e.isBuy ? "badge--buy" : "badge--sell"}`}
                  >
                    {e.isBuy ? "BUY" : "SELL"}
                  </span>
                </span>
                <div className="tbl-asset">
                  {company && (
                    <span
                      className="logo"
                      style={{ background: company.logoBg, color: "#fff" }}
                    >
                      {e.symbol.slice(0, 2)}
                    </span>
                  )}
                  <div className="nm">
                    <span className="sym">{e.symbol}</span>
                    <span className="sub">{company?.name ?? "—"}</span>
                  </div>
                </div>
                <span className="tbl-num">
                  {fmtQty(qty)} {e.symbol}{" "}
                  <span style={{ color: "var(--fg-faint)" }}>· ${fmtUsd(price)}</span>
                </span>
                <span className="tbl-num">${fmtUsd(total)}</span>
                <span className="tbl-mono col-hide">{shortAddress(e.counterparty)}</span>
                <span
                  className="tbl-mono col-hide"
                  style={{ textAlign: "right" }}
                >
                  <a
                    href={`https://testnet.snowtrace.io/tx/${e.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortHash(e.txHash)}
                    <span className="link-arrow"> ↗</span>
                  </a>
                </span>
              </div>
            );
          })}
        </div>

        <Toast on={toastOn} msg={`copiado · ${address ? shortAddress(address) : ""}`} />
      </div>
    </div>
  );
}
