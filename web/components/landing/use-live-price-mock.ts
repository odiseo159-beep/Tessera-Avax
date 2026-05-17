"use client";

import { useEffect, useRef, useState } from "react";

/// Smooth, slow mean-reverting random walk around an anchor price plus a
/// `tick` counter that increments on every update so the UI can pulse on
/// change. Lifted from the design prototype; we keep the simulated walk on
/// the landing because it makes the ticker and market cards visibly "alive"
/// at all times. Real prices live in the trade view via `useLivePrice`.
export interface MockPrice {
  price: number;
  tick: number;
  dir: number;
}

export function useLivePriceMock(
  anchor: number,
  vol = 0.0008,
  intervalMs = 1800
): MockPrice {
  const [price, setPrice] = useState(anchor);
  const [tick, setTick] = useState(0);
  const [dir, setDir] = useState(0);
  const anchorRef = useRef(anchor);
  anchorRef.current = anchor;

  useEffect(() => {
    const id = setInterval(() => {
      setPrice((prev) => {
        const drift = (Math.random() - 0.5) * 2 * vol * anchorRef.current;
        const meanRevert = (anchorRef.current - prev) * 0.05;
        const next = Math.max(0.01, prev + drift + meanRevert);
        setDir(next - prev);
        return next;
      });
      setTick((t) => t + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [vol, intervalMs]);

  return { price, tick, dir };
}
