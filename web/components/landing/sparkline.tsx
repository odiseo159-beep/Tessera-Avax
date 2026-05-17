"use client";

import { useMemo } from "react";

interface SparklineProps {
  color: string;
  seed?: number;
  w?: number;
  h?: number;
}

/// Deterministic, seeded random walk rendered as an SVG path with a soft
/// gradient fill underneath. Pure visual flair — no live data.
export function Sparkline({ color, seed = 1, w = 120, h = 28 }: SparklineProps) {
  const { stroke, fill } = useMemo(() => {
    let y = 0.5;
    const out: number[] = [];
    let s = seed;
    const rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 36; i++) {
      y += (rng() - 0.5) * 0.16;
      y = Math.max(0.08, Math.min(0.92, y));
      out.push(y);
    }
    const path = out
      .map((py, i) => {
        const x = (i / (out.length - 1)) * w;
        const yy = (1 - py) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${yy.toFixed(1)}`;
      })
      .join(" ");
    return { stroke: path, fill: `${path} L${w},${h} L0,${h} Z` };
  }, [seed, w, h]);

  const gradId = `spark-grad-${seed}-${w}-${h}`;
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradId})`} />
      <path
        d={stroke}
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
