"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

export type Timespan = "1D" | "1W" | "1M" | "1Y" | "ALL";

interface PriceChartProps {
  accent: string;
  anchor: number;
  seed?: number;
  timespan: Timespan;
  dense?: boolean;
  /// Optional real data series (close prices in chronological order). When
  /// provided, overrides the deterministic walk. Used by the Public side
  /// (Dinari historical) and any future on-chain fill series.
  data?: number[];
}

function makeRng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const fmtPrice = (n: number): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function generateWalk(
  anchor: number,
  seedKey: number,
  timespan: Timespan
): number[] {
  const rng = makeRng(seedKey);
  const N =
    timespan === "1D" ? 96 :
    timespan === "1W" ? 168 :
    timespan === "1M" ? 120 :
    timespan === "1Y" ? 200 :
    260;
  const vol =
    timespan === "1D" ? 0.004 :
    timespan === "1W" ? 0.008 :
    timespan === "1M" ? 0.012 :
    timespan === "1Y" ? 0.020 :
    0.022;
  const trend =
    timespan === "1Y" || timespan === "ALL" ? 0.0004 :
    timespan === "1M" ? 0.0002 :
    0.00005;
  let v =
    anchor *
    (timespan === "1Y" || timespan === "ALL"
      ? 0.78
      : timespan === "1M"
        ? 0.92
        : 0.985);
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    const drift = (rng() - 0.5) * 2 * vol * v;
    v = Math.max(anchor * 0.5, v + drift + v * trend);
    out.push(v);
  }
  // Force last point near anchor so it matches the live header price.
  const tail = Math.max(1, Math.floor(N / 3));
  const correction = (anchor - out[out.length - 1]) / tail;
  for (let i = out.length - tail; i < out.length; i++) {
    out[i] += correction * (i - (out.length - tail));
  }
  return out;
}

interface HoverState {
  i: number;
  x: number;
  y: number;
  v: number;
}

export function PriceChart({
  accent,
  anchor,
  seed = 1,
  timespan,
  dense = false,
  data,
}: PriceChartProps) {
  const seedKey = seed + (timespan.charCodeAt(0) || 0) * 1000;
  const pts = useMemo<number[]>(() => {
    if (data && data.length > 1) return data;
    return generateWalk(anchor, seedKey, timespan);
  }, [data, anchor, seedKey, timespan]);

  const ref = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 600, h: 320 });
  const [hover, setHover] = useState<HoverState | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setSize({ w: Math.max(200, cr.width), h: Math.max(180, cr.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const padL = 0;
  const padR = 56;
  const padT = 16;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = Math.max(max - min, 0.0001);

  const xFor = (i: number) => padL + (i / (pts.length - 1)) * innerW;
  const yFor = (v: number) => padT + (1 - (v - min) / range) * innerH;

  const linePath = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${xFor(pts.length - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${xFor(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;

  const yTicks = useMemo(() => {
    const N = 5;
    const out: number[] = [];
    for (let i = 0; i <= N; i++) out.push(min + (range * i) / N);
    return out;
  }, [min, range]);

  const xLabels = useMemo(() => {
    if (timespan === "1D") return ["10:00", "12:00", "14:00", "16:00", "18:00"];
    if (timespan === "1W") return ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
    if (timespan === "1M") return ["1 nov", "8 nov", "15 nov", "22 nov", "29 nov"];
    if (timespan === "1Y") return ["may", "jul", "sep", "nov", "ene", "mar"];
    return ["2023", "2024", "2025", "2026"];
  }, [timespan]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const i = Math.max(
      0,
      Math.min(pts.length - 1, Math.round(((x - padL) / innerW) * (pts.length - 1)))
    );
    setHover({ i, x: xFor(i), y: yFor(pts[i]), v: pts[i] });
  };

  const last = pts[pts.length - 1];

  return (
    <div
      ref={wrapRef}
      className={`chart-canvas ${hover ? "is-hover" : ""}`}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        ref={ref}
        className="chart-svg"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`chart-fill-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={dense ? 0.16 : 0.2} />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y-grid */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={padL + innerW}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="rgba(26,29,33,0.07)"
              strokeWidth="0.5"
              strokeDasharray={i === 0 || i === yTicks.length - 1 ? "" : "2 4"}
            />
            <text
              x={padL + innerW + 8}
              y={yFor(t) + 4}
              fontFamily="var(--font-mono)"
              fontSize="10.5"
              fill="rgba(26,29,33,0.46)"
              textAnchor="start"
            >
              ${fmtPrice(t)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {xLabels.map((lbl, i) => {
          const x = padL + (i / (xLabels.length - 1)) * innerW;
          return (
            <text
              key={i}
              x={x}
              y={h - 8}
              fontFamily="var(--font-mono)"
              fontSize="10.5"
              fill="rgba(26,29,33,0.46)"
              textAnchor={
                i === 0
                  ? "start"
                  : i === xLabels.length - 1
                    ? "end"
                    : "middle"
              }
            >
              {lbl}
            </text>
          );
        })}

        <path d={areaPath} fill={`url(#chart-fill-${seed})`} />
        <path
          d={linePath}
          fill="none"
          stroke={accent}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx={xFor(pts.length - 1)} cy={yFor(last)} r="3.5" fill={accent} />
        <circle cx={xFor(pts.length - 1)} cy={yFor(last)} r="3.5" fill={accent} opacity="0.25">
          <animate attributeName="r" values="3.5;9;3.5" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
        </circle>

        {hover && (
          <g>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={padT}
              y2={padT + innerH}
              stroke="rgba(26,29,33,0.35)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            <line
              x1={padL}
              x2={padL + innerW}
              y1={hover.y}
              y2={hover.y}
              stroke="rgba(26,29,33,0.35)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            <circle cx={hover.x} cy={hover.y} r="3.5" fill={accent} stroke="#fff" strokeWidth="1.4" />
          </g>
        )}
      </svg>

      {hover && (
        <div className="chart-tooltip" style={{ left: hover.x, top: hover.y }}>
          ${fmtPrice(hover.v)}
        </div>
      )}
    </div>
  );
}
