"use client";

interface HeroProps {
  variant?: "stagger" | "instant";
}

const HEADLINE_WORDS: Array<{ t: string; c: string }> = [
  { t: "Dos", c: "" },
  { t: "universos", c: "" },
  { t: "de", c: "" },
  { t: "activos.", c: "" },
  { t: "Una", c: "" },
  { t: "sola", c: "" },
  { t: "identidad", c: "is-accent" },
  { t: "on-chain.", c: "" },
];

export function Hero({ variant = "stagger" }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div className="hero-text">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Avalanche LatAm Institucional · Fuji testnet
          </div>
          <h1 className={`display ${variant === "stagger" ? "is-stagger" : ""}`}>
            {HEADLINE_WORDS.map((w, i) => (
              <span key={i} className="word" style={{ ["--i" as string]: i }}>
                <span className={`word-inner ${w.c}`}>{w.t}</span>
              </span>
            ))}
          </h1>
          <p className="lede">
            Equity privado de LatAm y equity público de US, tokenizados en un
            mismo orderbook on-chain. Verificas KYC una vez. Operas en ambos
            universos. <span className="lede-mono">ERC-3643 enforced</span>.
          </p>
          <div className="hero-meta">
            <span className="meta-item">
              <span className="meta-label">Chain</span>
              <span className="meta-val">Avalanche Fuji</span>
            </span>
            <span className="meta-sep" />
            <span className="meta-item">
              <span className="meta-label">Compliance</span>
              <span className="meta-val">ERC-3643 · IdentityRegistry</span>
            </span>
            <span className="meta-sep" />
            <span className="meta-item">
              <span className="meta-label">Public vía</span>
              <span className="meta-val">Dinari sandbox</span>
            </span>
          </div>
        </div>

        <aside className="hero-visual" aria-hidden="true">
          <div className="hero-loader">
            <span className="hero-loader-paint" />
            <span className="hero-loader-logo" />
            <span className="hero-loader-dot" />
            <span className="hero-loader-meta">
              <span className="hero-loader-meta-dot" />
              live · 10 tokens · 1 identity
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
