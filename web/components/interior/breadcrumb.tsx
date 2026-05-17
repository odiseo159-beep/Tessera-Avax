"use client";

import Link from "next/link";

interface BreadcrumbProps {
  universe: "private" | "public";
  symbol: string;
}

export function Breadcrumb({ universe, symbol }: BreadcrumbProps) {
  const accent = universe === "private" ? "#0F6E56" : "#3C3489";
  const shadow =
    universe === "private"
      ? "0 0 0 3px rgba(15,110,86,0.16)"
      : "0 0 0 3px rgba(60,52,137,0.16)";

  return (
    <div className="eyebrow" style={{ marginBottom: 8 }}>
      <Link
        href={`/${universe}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
      >
        <span
          className="eyebrow-dot"
          style={{ background: accent, boxShadow: shadow }}
        />
        {universe === "private" ? "Tessera Private" : "Tessera Public"}
      </Link>
      <span
        style={{
          color: "var(--fg-faint)",
          margin: "0 8px",
          fontFamily: "var(--font-mono)",
          letterSpacing: 0,
        }}
      >
        /
      </span>
      <span style={{ color: "var(--fg)" }}>{symbol}</span>
    </div>
  );
}
