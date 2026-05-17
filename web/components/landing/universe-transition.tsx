"use client";

import { useEffect } from "react";

interface UniverseTransitionProps {
  universe: "private" | "public" | null;
  onDone: () => void;
}

/// Full-screen overlay that fades in when the user clicks a market card,
/// holds for ~1s, then triggers `onDone` so the parent can navigate. Acts
/// as a cinematic "entering universe" punctuation between landing and the
/// destination route.
export function UniverseTransition({ universe, onDone }: UniverseTransitionProps) {
  useEffect(() => {
    if (!universe) return;
    const id = setTimeout(onDone, 1100);
    return () => clearTimeout(id);
  }, [universe, onDone]);

  if (!universe) return null;

  const accent = universe === "private" ? "#0F6E56" : "#3C3489";
  const label = universe === "private" ? "Tessera Private" : "Tessera Public";
  const meta =
    universe === "private"
      ? "ERC-3643 · IdentityRegistry · 4 tokens"
      : "Dinari sandbox · 6 tickers · live";

  return (
    <div
      className={`universe-overlay universe-overlay--${universe}`}
      style={{ ["--accent" as string]: accent }}
    >
      <div className="uo-fill" />
      <div className="uo-inner">
        <span className="uo-eyebrow">
          <span className="uo-dot" />
          entrando a
        </span>
        <span className="uo-title">{label}</span>
        <span className="uo-bar">
          <span className="uo-bar-fill" />
        </span>
        <span className="uo-meta mono">{meta}</span>
      </div>
    </div>
  );
}
