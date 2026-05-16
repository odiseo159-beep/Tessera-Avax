"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { contractsReady, type Address } from "@/lib/contracts";
import { useKycStatus } from "@/hooks/use-kyc-status";
import { usePlaceOrder } from "@/hooks/use-place-order";
import type { CompanyMeta } from "@/lib/mock-companies";

interface TradePanelProps {
  company: CompanyMeta;
  tokenAddress: Address;
  /// Optional prefill from clicking an orderbook row
  prefill?: { price: number; isBuy: boolean } | null;
  onSubmitted?: () => void;
}

const FEE_PCT = 0.003;

function parseDecimal(input: string): number {
  if (!input) return 0;
  const n = Number(input);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function toBaseUnits(amountTokens: number): bigint {
  if (amountTokens <= 0) return 0n;
  // Avoid BigInt(float) — go via string with fixed precision
  const [whole, frac = ""] = amountTokens.toFixed(8).split(".");
  return BigInt(whole) * 10n ** 18n + BigInt(frac.padEnd(18, "0").slice(0, 18));
}

function toUsdcBaseUnits(priceUsdc: number): bigint {
  if (priceUsdc <= 0) return 0n;
  const [whole, frac = ""] = priceUsdc.toFixed(6).split(".");
  return BigInt(whole) * 10n ** 6n + BigInt(frac.padEnd(6, "0").slice(0, 6));
}

export function TradePanel({
  company,
  tokenAddress,
  prefill,
  onSubmitted,
}: TradePanelProps) {
  const { isConnected } = useAccount();
  const { state: kycState } = useKycStatus();
  const place = usePlaceOrder();

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(company.midPriceUsdc.toFixed(2));

  useEffect(() => {
    if (!prefill) return;
    setSide(prefill.isBuy ? "buy" : "sell");
    setPrice(prefill.price.toFixed(2));
  }, [prefill]);

  useEffect(() => {
    if (place.state === "success") {
      setAmount("");
      onSubmitted?.();
      const t = setTimeout(() => place.reset(), 2500);
      return () => clearTimeout(t);
    }
  }, [place.state, onSubmitted, place]);

  const amountNum = parseDecimal(amount);
  const priceNum = parseDecimal(price);
  const subtotal = amountNum * priceNum;
  const fee = subtotal * FEE_PCT;
  const total = side === "buy" ? subtotal + fee : subtotal - fee;

  const blockReason = useMemo<string | null>(() => {
    if (!isConnected) return "Conecta tu wallet";
    if (!contractsReady) return "Contratos sin desplegar";
    if (kycState === "pending") return "Verifica tu KYC primero";
    if (kycState === "loading") return "Verificando KYC…";
    if (amountNum <= 0) return "Ingresa una cantidad";
    if (priceNum <= 0) return "Ingresa un precio";
    return null;
  }, [isConnected, kycState, amountNum, priceNum]);

  const submitting = place.state === "approving" || place.state === "placing";

  const handleSubmit = async () => {
    if (blockReason) return;
    await place.submit({
      token: tokenAddress,
      isBuy: side === "buy",
      amount: toBaseUnits(amountNum),
      price: toUsdcBaseUnits(priceNum),
    });
  };

  const submitLabel: string = (() => {
    if (place.state === "approving") return "Aprobando…";
    if (place.state === "placing") return "Colocando orden…";
    if (place.state === "success") return "Orden colocada";
    if (blockReason) return blockReason;
    return side === "buy" ? "Confirmar compra" : "Confirmar venta";
  })();

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")}>
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Operar</h3>
          <TabsList className="h-8">
            <TabsTrigger value="buy" className="text-xs">
              Comprar
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-xs">
              Vender
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={side} className="m-0 p-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs text-muted-foreground">
                Cantidad ({company.symbol})
              </Label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs text-muted-foreground">
                Precio (USDC)
              </Label>
              <Input
                id="price"
                inputMode="decimal"
                placeholder={company.midPriceUsdc.toFixed(2)}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="tabular-nums"
              />
            </div>

            <Separator />

            <dl className="space-y-1.5 text-xs tabular-nums">
              <div className="flex items-center justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <dt>Fee 0.3%</dt>
                <dd>${fee.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between font-semibold text-foreground">
                <dt>{side === "buy" ? "Total a pagar" : "Total a recibir"}</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>

            <Button
              onClick={handleSubmit}
              disabled={!!blockReason || submitting}
              className={cn(
                "w-full",
                side === "buy" ? "bg-[#0F6E56] hover:bg-[#0F6E56]/90" : "bg-[#C03737] hover:bg-[#C03737]/90"
              )}
            >
              {submitLabel}
            </Button>
            {place.errorMessage && (
              <p className="text-[11px] text-[#C03737]">{place.errorMessage}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
