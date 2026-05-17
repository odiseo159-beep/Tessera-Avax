"use client";

interface PHStatProps {
  tag: string;
  k: string | number;
  sub: string;
  live?: boolean;
}

export function PHStat({ tag, k, sub, live = false }: PHStatProps) {
  return (
    <div className="ph-stat">
      <span className="ph-stat-tag">
        <span className={`pol-dot ${live ? "is-live" : ""}`} />
        {tag}
      </span>
      <span className="ph-stat-k">{k}</span>
      <span className="ph-stat-sub">{sub}</span>
    </div>
  );
}
