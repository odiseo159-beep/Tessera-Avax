"use client";

import { useEffect, useRef } from "react";

/// Tessera hero — v2 immersive stage with autoplay video background.
/// The veil-on-click entry from the design prototype is intentionally
/// dropped: per pitch direction we want the video running from the
/// first paint so judges/visitors see motion the moment they land.
///
/// The video file lives in /public/hero-bg.mp4 and is served as a
/// static asset (Next won't try to compile it). Tint + vignette layers
/// on top tune the legibility of the headline against the footage.

interface HeroProps {
  /// "stagger" reveals the headline word-by-word via the existing
  /// .display.is-stagger animation. "instant" renders the full
  /// headline immediately — better when the video is doing the
  /// motion-grabbing.
  variant?: "stagger" | "instant";
  /// Reserved for future background variants (mosaic, aurora). Today
  /// only "video" ships; everything else falls back to a minimal bg.
  bg?: "video" | "minimal";
  /// 0.4..1.4 — multiplies opacity of the bg layers. Useful for
  /// experimenting with how aggressive the footage looks.
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

  // Light parallax: tracks the mouse and pushes CSS vars `--par-x` and
  // `--par-y` (both in -1..1). The hero-bg layers (tint, vignette,
  // potential blobs) consume those vars to drift in opposite directions
  // and give the static video a subtle depth response.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let raf = 0;
    let target = { x: 0, y: 0 };
    let cur = { x: 0, y: 0 };
    const apply = () => {
      cur = {
        x: cur.x + (target.x - cur.x) * 0.06,
        y: cur.y + (target.y - cur.y) * 0.06,
      };
      el.style.setProperty("--par-x", cur.x.toFixed(3));
      el.style.setProperty("--par-y", cur.y.toFixed(3));
      raf = requestAnimationFrame(apply);
    };
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      target = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      };
    };
    el.addEventListener("mousemove", move);
    raf = requestAnimationFrame(apply);
    return () => {
      el.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      className="hero-stage is-revealed"
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

      <div className="hero-stage-inner">
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
          // Belt-and-suspenders: some browsers (looking at you, Safari)
          // ignore the `muted` attribute on autoplay unless the property
          // is also set imperatively before play() is called.
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
