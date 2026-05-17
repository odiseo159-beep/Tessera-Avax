"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance } from "wagmi";

import { usePlaceOrder } from "@/hooks/use-place-order";
import { useUserBalances } from "@/hooks/use-user-balances";
import { useKycStatus } from "@/hooks/use-kyc-status";
import {
  contractAddresses,
  ZERO_ADDRESS,
  type Address,
  type TokenSymbol,
} from "@/lib/contracts";
import type { CompanyMeta } from "@/lib/mock-companies";

interface TradePanelProps {
  company: CompanyMeta;
  tokenAddress: Address;
  anchor: number;
  /// Optional prefill from clicking an orderbook row
  prefill?: { price: number; isBuy: boolean } | null;
  onSubmitted?: () => void;
}

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;
const FEE_PCT = 0.003;

function fmtPrice(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toTokenBaseUnits(amount: number): bigint {
  if (amount <= 0) return 0n;
  const [whole, frac = ""] = amount.toFixed(8).split(".");
  return BigInt(whole) * TOKEN_UNIT + BigInt(frac.padEnd(18, "0").slice(0, 18));
}

function toUsdcBaseUnits(price: number): bigint {
  if (price <= 0) return 0n;
  const [whole, frac = ""] = price.toFixed(6).split(".");
  return BigInt(whole) * USDC_UNIT + BigInt(frac.padEnd(6, "0").slice(0, 6));
}

export function TradePanel({
  company,
  tokenAddress,
  anchor,
  prefill,
  onSubmitted,
}: TradePanelProps) {
  const { address, isConnected } = useAccount();
  const { state: kycState } = useKycStatus();
  const place = usePlaceOrder();
  const balances = useUserBalances();

  const { data: usdcBalance } = useBalance({
    address,
    token: contractAddresses.usdc !== ZERO_ADDRESS ? contractAddresses.usdc : undefined,
    query: { enabled: isConnected && contractAddresses.usdc !== ZERO_ADDRESS },
  });

  const usdcAvailable = usdcBalance
    ? Number(usdcBalance.value) / Number(USDC_UNIT)
    : 0;
  const tokenHolding = balances.tokens.find((t) => t.symbol === (company.symbol as TokenSymbol));
  const holding = tokenHolding ? Number(tokenHolding.amount) / Number(TOKEN_UNIT) : 0;

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"limit" | "market">("limit");
  const [qty, setQty] = useState<number>(1);
  const [price, setPrice] = useState<number>(anchor);

  useEffect(() => {
    setPrice(anchor);
  }, [anchor]);

  useEffect(() => {
    if (!prefill) return;
    setSide(prefill.isBuy ? "buy" : "sell");
    setPrice(prefill.price);
  }, [prefill]);

  useEffect(() => {
    if (place.state === "success") {
      setQty(1);
      onSubmitted?.();
      const t = setTimeout(() => place.reset(), 2500);
      return () => clearTimeout(t);
    }
  }, [place.state, onSubmitted, place]);

  const effectivePrice = type === "market" ? anchor : price;
  const subtotal = qty * effectivePrice;
  const fee = subtotal * FEE_PCT;
  const grand = side === "buy" ? subtotal + fee : subtotal - fee;

  const blockReason = useMemo<string | null>(() => {
    if (!isConnected) return "Conecta tu wallet";
    if (kycState === "pending") return "Verifica tu KYC primero";
    if (kycState === "loading") return "Verificando KYC…";
    if (qty <= 0) return "Ingresa una cantidad";
    if (effectivePrice <= 0) return "Ingresa un precio";
    return null;
  }, [isConnected, kycState, qty, effectivePrice]);

  const submitting = place.state === "approving" || place.state === "placing";

  const handleSubmit = async () => {
    if (blockReason) return;
    await place.submit({
      token: tokenAddress,
      isBuy: side === "buy",
      amount: toTokenBaseUnits(qty),
      price: toUsdcBaseUnits(effectivePrice),
    });
  };

  const submitLabel = (() => {
    if (place.state === "approving") return "Aprobando…";
    if (place.state === "placing") return "Colocando orden…";
    if (place.state === "success") return "Orden colocada";
    if (blockReason) return blockReason;
    return side === "buy" ? `Comprar ${qty || 0} ${company.symbol}` : `Vender ${qty || 0} ${company.symbol}`;
  })();

  return (
    <div className="tp-card">
      <div className="tp-side-toggle">
        <span className={`tp-side-thumb is-${side}`} />
        <button
          type="button"
          className={`tp-side-btn is-buy ${side === "buy" ? "is-active" : ""}`}
          onClick={() => setSide("buy")}
        >
          Comprar
        </button>
        <button
          type="button"
          className={`tp-side-btn is-sell ${side === "sell" ? "is-active" : ""}`}
          onClick={() => setSide("sell")}
        >
          Vender
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="tp-type-pills">
          <button
            type="button"
            className={`pill ${type === "limit" ? "is-active" : ""}`}
            onClick={() => setType("limit")}
          >
            Limit
          </button>
          <button
            type="button"
            className={`pill ${type === "market" ? "is-active" : ""}`}
            onClick={() => setType("market")}
          >
            Market
          </button>
        </div>
        <span className="badge badge--mono">${fmtPrice(anchor)}</span>
      </div>

      <div className="tp-field">
        <div className="tp-field-label">
          <span>Cantidad</span>
          <button
            type="button"
            className="max-btn"
            onClick={() =>
              setQty(side === "buy" ? Math.floor(usdcAvailable / Math.max(0.01, effectivePrice)) : Math.floor(holding))
            }
          >
            max
          </button>
        </div>
        <div className="tp-input-wrap">
          <input
            className="tp-input"
            type="number"
            min="0"
            step="1"
            value={qty}
            onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
          />
          <span className="tp-input-suffix">{company.symbol}</span>
        </div>
      </div>

      <div className="tp-field">
        <div className="tp-field-label">
          <span>
            Precio{" "}
            {type === "market" && (
              <span className="badge" style={{ marginLeft: 6 }}>
                auto
              </span>
            )}
          </span>
          <span className="max-btn">USDC</span>
        </div>
        <div className="tp-input-wrap">
          <input
            className="tp-input"
            type="number"
            min="0"
            step="0.01"
            value={type === "market" ? anchor.toFixed(2) : price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            disabled={type === "market"}
            style={type === "market" ? { color: "var(--fg-faint)" } : undefined}
          />
          <span className="tp-input-suffix">USDC</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 4 }}>
        <div className="tp-row">
          <span>Subtotal</span>
          <span className="mono">${fmtPrice(subtotal)}</span>
        </div>
        <div className="tp-row">
          <span>
            Fee · <span className="b">0.30%</span>
          </span>
          <span className="mono">${fmtPrice(fee)}</span>
        </div>
        <div className="tp-row is-total">
          <span>Total {side === "buy" ? "a pagar" : "a recibir"}</span>
          <span className="v">
            ${fmtPrice(grand)}{" "}
            <span
              style={{
                color: "var(--fg-faint)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 400,
              }}
            >
              USDC
            </span>
          </span>
        </div>
      </div>

      <button
        type="button"
        className={`tp-submit ${side === "sell" ? "is-sell" : ""}`}
        onClick={handleSubmit}
        disabled={!!blockReason || submitting}
      >
        {submitLabel}
      </button>
      {place.errorMessage && (
        <p style={{ fontSize: 11, color: "var(--destructive)", marginTop: -4 }}>
          {place.errorMessage}
        </p>
      )}

      <div className="tp-foot">
        <span>balance</span>
        <span className="mono" style={{ color: "var(--fg)" }}>
          ${fmtPrice(usdcAvailable)} USDC
        </span>
        <span style={{ flex: 1 }} />
        <span>posición</span>
        <span className="mono" style={{ color: "var(--fg)" }}>
          {holding.toLocaleString("en-US", { maximumFractionDigits: 4 })} {company.symbol}
        </span>
      </div>
    </div>
  );
}
