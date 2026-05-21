"use client";

import { useEffect, useRef, useState } from "react";

/// Tessera hero — v2 immersive stage with autoplay video background and
/// a click-to-reveal logo veil over the top. The user lands on a big
/// Tessera mark; clicking it slides the hero text up over the (already
/// playing) video.

interface HeroProps {
  /// "stagger" reveals the headline word-by-word via .display.is-stagger.
  /// "instant" renders the full headline immediately — useful when the
  /// video is already doing the motion-grabbing.
  variant?: "stagger" | "instant";
  /// Reserved for future bg variants (mosaic, aurora). Today only
  /// "video" ships; "minimal" is the fallback.
  bg?: "video" | "minimal";
  /// 0.4..1.4 — multiplies opacity of the bg layers.
  intensity?: number;
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

export function Hero({
  variant = "stagger",
  bg = "video",
  intensity = 1,
}: HeroProps) {
  const stageRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  // Light parallax: tracks the mouse and pushes CSS vars `--par-x` and
  // `--par-y` (both in -1..1). The hero-bg layers consume those vars
  // to drift in opposite directions and give the static video subtle
  // depth response.
  //
  // The rAF loop self-suspends when the interpolated `cur` matches
  // `target` (no in-flight motion). A new mousemove resumes it. This
  // avoids burning a frame per refresh just to interpolate 0 → 0 while
  // the user isn't moving the cursor.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const apply = () => {
      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        // Snap to exact target and idle until the next mousemove.
        cur.x = target.x;
        cur.y = target.y;
        el.style.setProperty("--par-x", cur.x.toFixed(3));
        el.style.setProperty("--par-y", cur.y.toFixed(3));
        raf = 0;
        return;
      }
      cur.x += dx * 0.08;
      cur.y += dy * 0.08;
      el.style.setProperty("--par-x", cur.x.toFixed(3));
      el.style.setProperty("--par-y", cur.y.toFixed(3));
      raf = requestAnimationFrame(apply);
    };
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener("mousemove", move);
    return () => {
      el.removeEventListener("mousemove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      className={`hero-stage ${revealed ? "is-revealed" : "is-veiled"}`}
      id="top"
      data-bg={bg}
      style={{
        ["--par-x" as string]: 0,
        ["--par-y" as string]: 0,
        ["--intensity" as string]: intensity,
      }}
    >
      <HeroBg bg={bg} />
      <div className="hero-stage-fade" aria-hidden="true" />

      {/* Veil — the big tessera mark the user clicks to enter. The video
          is already playing behind it, so the experience is "watch the
          logo breathe, then dive in". */}
      <button
        type="button"
        className="hero-veil"
        onClick={() => setRevealed(true)}
        aria-label="Entrar a Tessera"
        aria-hidden={revealed}
        tabIndex={revealed ? -1 : 0}
      >
        <span className="hero-veil-eyebrow">
          <span className="hero-veil-dot" />
          Avalanche LatAm Institucional
        </span>
        <span className="hero-veil-logo">
          <img src="/brand/tessera.png" alt="Tessera" />
          <span className="hero-veil-ring" aria-hidden="true" />
          <span className="hero-veil-ring hero-veil-ring--2" aria-hidden="true" />
          <span className="hero-veil-ring hero-veil-ring--3" aria-hidden="true" />
        </span>
        <span className="hero-veil-arrow" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 14L12 8L18 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div className="hero-stage-inner" aria-hidden={!revealed}>
        <div className="hero-eyebrow eyebrow">
          <span className="eyebrow-dot" />
          Avalanche LatAm Institucional · Fuji testnet
        </div>
        <h1
          className={`display hero-display ${
            variant === "stagger" ? "is-stagger" : ""
          }`}
        >
          {variant === "stagger" ? (
            HEADLINE_WORDS.map((w, i) => (
              <span key={i} className="word" style={{ ["--i" as string]: i }}>
                <span className={`word-inner ${w.c}`}>{w.t}</span>
              </span>
            ))
          ) : (
            <>
              Dos universos de activos. Una sola{" "}
              <span className="hero-accent-word">identidad</span> on-chain.
            </>
          )}
        </h1>
        <p className="lede hero-lede">
          Equity privado de LatAm y equity público de US, tokenizados en un
          mismo orderbook on-chain. Verificas KYC una vez. Operas en ambos
          universos. <span className="lede-mono">ERC-3643 enforced</span>.
        </p>

        <div className="hero-cta-row">
          <a className="btn-primary" href="#choose">
            Explorar mercados
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a className="btn-ghost" href="#how">
            <span className="btn-ghost-dot" />
            Cómo funciona
          </a>
        </div>

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
    </section>
  );
}

function HeroBg({ bg }: { bg: "video" | "minimal" }) {
  if (bg === "video") {
    return (
      <div className="hero-bg hero-bg--video" aria-hidden="true">
        <video
          className="hero-bg-video"
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          // Belt-and-suspenders: some browsers (Safari) ignore the
          // `muted` attribute on autoplay unless the property is also
          // set imperatively before play() is called.
          ref={(el) => {
            if (el) {
              el.muted = true;
              el.defaultMuted = true;
              el.volume = 0;
            }
          }}
        />
        <div className="hero-bg-tint" />
        <div className="hero-bg-vignette" />
      </div>
    );
  }
  return <div className="hero-bg hero-bg--minimal" aria-hidden="true" />;
}
