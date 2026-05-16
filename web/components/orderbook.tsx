"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  groupOrderbook,
  OrderbookLevel,
  useOrders,
} from "@/hooks/use-orders";
import type { CompanyMeta } from "@/lib/mock-companies";
import type { Address } from "@/lib/contracts";

interface OrderbookProps {
  company: CompanyMeta;
  tokenAddress: Address;
  onLevelClick?: (price: bigint, isBuy: boolean) => void;
}

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

function formatPrice(price: bigint): string {
  const whole = Number(price) / Number(USDC_UNIT);
  return whole.toFixed(2);
}

function formatAmount(amount: bigint): string {
  const whole = Number(amount) / Number(TOKEN_UNIT);
  return whole.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatTotal(price: bigint, amount: bigint): string {
  const total = (price * amount) / TOKEN_UNIT;
  const whole = Number(total) / Number(USDC_UNIT);
  return whole.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

interface RowProps {
  level: OrderbookLevel;
  isBuy: boolean;
  pctOfMax: number;
  onClick?: () => void;
}

function Row({ level, isBuy, pctOfMax, onClick }: RowProps) {
  const sideColor = isBuy ? "text-[#0F6E56]" : "text-[#C03737]";
  const fillColor = isBuy
    ? "bg-[#0F6E56]/10"
    : "bg-[#C03737]/10";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative grid w-full grid-cols-[1fr_1fr_1fr] gap-2 px-3 py-1 text-right text-xs tabular-nums transition-colors hover:bg-muted/50"
    >
      <span
        className={cn("absolute inset-y-0 right-0", fillColor)}
        style={{ width: `${Math.min(100, pctOfMax)}%` }}
      />
      <span className={cn("relative z-10 font-medium", sideColor)}>
        {formatPrice(level.price)}
      </span>
      <span className="relative z-10 text-foreground">
        {formatAmount(level.amount)}
      </span>
      <span className="relative z-10 text-muted-foreground">
        {formatTotal(level.price, level.amount)}
      </span>
    </button>
  );
}

export function Orderbook({ company, tokenAddress, onLevelClick }: OrderbookProps) {
  const { orders, isLoading, fromChain } = useOrders(company, tokenAddress);
  const grouped = useMemo(() => groupOrderbook(orders), [orders]);

  const maxAmount = useMemo(() => {
    let m = 0n;
    for (const lvl of grouped.bids) if (lvl.amount > m) m = lvl.amount;
    for (const lvl of grouped.asks) if (lvl.amount > m) m = lvl.amount;
    return m;
  }, [grouped]);

  const pct = (amount: bigint): number => {
    if (maxAmount === 0n) return 0;
    return Number((amount * 100n) / maxAmount);
  };

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Orderbook</h3>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {fromChain ? "On-chain" : "Mock"} · {orders.filter((o) => o.active).length} órdenes
        </span>
      </div>

      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-border/60 px-3 py-2 text-right text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Precio (USDC)</span>
        <span>Cantidad</span>
        <span>Total</span>
      </div>

      <div className="flex flex-col">
        {isLoading ? (
          <div className="space-y-2 px-3 py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col-reverse">
              {grouped.asks.slice(0, 8).map((lvl) => (
                <Row
                  key={`a-${lvl.price.toString()}`}
                  level={lvl}
                  isBuy={false}
                  pctOfMax={pct(lvl.amount)}
                  onClick={onLevelClick ? () => onLevelClick(lvl.price, true) : undefined}
                />
              ))}
            </div>

            <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-y border-border/60 bg-muted/40 px-3 py-2 text-right text-xs">
              <span className="text-left text-muted-foreground">Spread</span>
              <span className="text-foreground">
                {grouped.spread !== null ? formatPrice(grouped.spread) : "—"}
              </span>
              <span className="text-muted-foreground">
                {grouped.mid !== null ? formatPrice(grouped.mid) : "—"}
              </span>
            </div>

            <div className="flex flex-col">
              {grouped.bids.slice(0, 8).map((lvl) => (
                <Row
                  key={`b-${lvl.price.toString()}`}
                  level={lvl}
                  isBuy
                  pctOfMax={pct(lvl.amount)}
                  onClick={onLevelClick ? () => onLevelClick(lvl.price, false) : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
