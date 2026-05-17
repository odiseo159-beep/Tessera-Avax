"use client";

import { useEffect, useState } from "react";
import { useLivePriceMock } from "@/components/landing/use-live-price-mock";
import { fmtPrice } from "@/components/landing/landing-data";

interface AssetPriceCellProps {
  anchor: number;
  /// Real on-chain or Dinari live price, if available. Overrides the mock walk
  /// while still triggering the flash animation on each tick.
  livePrice?: number;
  className?: string;
  vol?: number;
  intervalMs?: number;
}

/// Inline span that renders the formatted USDC price and pulses on every
/// upstream update. Used in asset header and asset card big-price slots.
export function AssetPriceCell({
  anchor,
  livePrice,
  className = "",
  vol = 0.0007,
  intervalMs = 2400,
}: AssetPriceCellProps) {
  const { price: mockPrice, tick, dir } = useLivePriceMock(anchor, vol, intervalMs);
  const [flash, setFlash] = useState(0);
  const display = livePrice ?? mockPrice;

  useEffect(() => {
    setFlash(dir > 0 ? 1 : dir < 0 ? -1 : 0);
    const id = setTimeout(() => setFlash(0), 520);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, livePrice]);

  const flashCls =
    flash === 1 ? "is-flash-up" : flash === -1 ? "is-flash-down" : "";

  return <span className={`${className} ${flashCls}`}>${fmtPrice(display)}</span>;
}
