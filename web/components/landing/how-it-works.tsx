"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/// Tessera "Cómo funciona" — tabbed v2 redesign powered by Framer
/// Motion. The active-tab pill uses a shared `layoutId` so it slides
/// smoothly between tabs without any manual measurement; the panel
/// body cross-fades + blurs between steps via AnimatePresence.
///
/// Styling stays in our system (var(--fg), var(--card), var(--border)),
/// not the dark glass of the demo we mirrored.

type Tone = "g" | "p" | "duo";

interface Step {
  id: string;
  t: string;
  d: string;
  tag: string;
  tone: Tone;
  visual: React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: "01",
    t: "Conecta",
    d: "Cualquier wallet EVM funciona. RainbowKit + wagmi conectan a Avalanche Fuji en un click. No hace falta cuenta ni email.",
    tag: "wagmi · ~10s",
    tone: "g",
    visual: <WalletVisual />,
  },
  {
    id: "02",
    t: "Verifica",
    d: "KYC una sola vez. Tu identidad queda registrada en IdentityRegistry on-chain. La misma identidad sirve para Private y Public.",
    tag: "ERC-3643 · ~2 min",
    tone: "duo",
    visual: <KycVisual />,
  },
  {
    id: "03",
    t: "Opera",
    d: "Place / cancel orders en el mismo orderbook para Private y Public. Compliance enforced en _update, settlement nativo en USDC.",
    tag: "fill atómico · ~3s",
    tone: "p",
    visual: <BookVisual />,
  },
];

export function HowItWorks() {
  const [active, setActive] = useState<string>(STEPS[0].id);
  const activeStep = STEPS.find((s) => s.id === active) ?? STEPS[0];

  return (
    <section className="how" id="how">
      <div className="eyebrow">
        <span className="eyebrow-dot" />
        Cómo funciona
      </div>
      <h2 className="how-title">Tres pasos. Una sola identidad.</h2>

      <div className="how-tabs-wrap">
        <div className="how-tabs" role="tablist" aria-label="Pasos">
          {STEPS.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`how-tab how-tab--${s.tone} ${isActive ? "is-active" : ""}`}
                role="tab"
                aria-selected={isActive}
                type="button"
              >
                {isActive && (
                  <motion.span
                    layoutId="how-tabs-pill"
                    className={`how-tabs-pill how-tabs-pill--${s.tone}`}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <span className="how-tab-n mono">{s.id}</span>
                <span className="how-tab-l">{s.t}</span>
              </button>
            );
          })}
        </div>

        <div className="how-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              className="how-panel-body is-active"
              role="tabpanel"
              initial={{ opacity: 0, x: -12, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 12, filter: "blur(8px)" }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="how-panel-visual">{activeStep.visual}</div>
              <div className="how-panel-copy">
                <div className="how-panel-meta">
                  <span className="how-panel-n mono">{activeStep.id}</span>
                  <span className="how-panel-rule" />
                  <span className="how-panel-tag mono">{activeStep.tag}</span>
                </div>
                <h3 className="how-panel-t">{activeStep.t}</h3>
                <p className="how-panel-d">{activeStep.d}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ── Per-step visuals ────────────────────────────────────────────────────

function WalletVisual() {
  return (
    <div className="step-visual step-visual--wallet">
      <div className="sv-row">
        <div className="sv-chip">
          <span className="sv-dot sv-dot--ok" /> wallet detectada
        </div>
        <div className="sv-chip sv-chip--mono">Fuji · 43113</div>
      </div>
      <div className="sv-wallet">
        <div className="sv-wallet-head">
          <span className="sv-w-ic" />
          <div>
            <div className="sv-w-name">Conectar wallet</div>
            <div className="sv-w-sub mono">0x4A2…E91c</div>
          </div>
          <div className="sv-w-action">Conectar</div>
        </div>
        <div className="sv-wallet-list">
          <div className="sv-wallet-row">
            <span className="sv-w-logo" style={{ background: "#F6851B" }}>
              M
            </span>
            MetaMask<span className="sv-w-arrow">→</span>
          </div>
          <div className="sv-wallet-row sv-wallet-row--active">
            <span className="sv-w-logo" style={{ background: "#3B99FC" }}>
              W
            </span>
            WalletConnect<span className="sv-w-arrow">→</span>
          </div>
          <div className="sv-wallet-row">
            <span className="sv-w-logo" style={{ background: "#1A1D21" }}>
              R
            </span>
            Rainbow<span className="sv-w-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KycVisual() {
  return (
    <div className="step-visual step-visual--kyc">
      <div className="sv-row">
        <div className="sv-chip">
          <span className="sv-dot sv-dot--ok" /> identidad verificada
        </div>
        <div className="sv-chip sv-chip--mono">ONCHAINID #4297</div>
      </div>
      <div className="sv-kyc">
        <div className="sv-kyc-head">
          <span className="sv-passport">
            <span className="sv-pp-line" />
            <span className="sv-pp-line" />
            <span className="sv-pp-line sv-pp-line--short" />
          </span>
          <div className="sv-kyc-fields">
            <div className="sv-kyc-field">
              <span className="lbl">NOMBRE</span>
              <span className="val">Juan ████</span>
            </div>
            <div className="sv-kyc-field">
              <span className="lbl">PAÍS</span>
              <span className="val">MX</span>
            </div>
            <div className="sv-kyc-field">
              <span className="lbl">KYC</span>
              <span className="val">
                <span className="sv-tick">✓</span> verificado
              </span>
            </div>
          </div>
        </div>
        <div className="sv-kyc-claims">
          <div className="sv-claim">
            <span className="sv-claim-dot sv-claim-dot--g" /> CLAIM 1 — KYC
          </div>
          <div className="sv-claim">
            <span className="sv-claim-dot sv-claim-dot--g" /> CLAIM 2 — Residencia
          </div>
          <div className="sv-claim">
            <span className="sv-claim-dot sv-claim-dot--p" /> CLAIM 3 — Accredited
          </div>
        </div>
      </div>
    </div>
  );
}

function BookVisual() {
  return (
    <div className="step-visual step-visual--book">
      <div className="sv-row">
        <div className="sv-chip">
          <span className="sv-dot sv-dot--ok is-live" /> live · BTS/USDC
        </div>
        <div className="sv-chip sv-chip--mono">spread 0.21%</div>
      </div>
      <div className="sv-book">
        <div className="sv-book-side sv-book-side--asks">
          <div className="sv-book-row">
            <span>32.48</span>
            <span>120</span>
            <span className="sv-bar" style={{ width: "30%" }} />
          </div>
          <div className="sv-book-row">
            <span>32.46</span>
            <span>340</span>
            <span className="sv-bar" style={{ width: "65%" }} />
          </div>
          <div className="sv-book-row">
            <span>32.44</span>
            <span>210</span>
            <span className="sv-bar" style={{ width: "42%" }} />
          </div>
        </div>
        <div className="sv-book-mid">
          <span className="sv-mid-price">$32.41</span>
          <span className="sv-mid-pct">+1.10%</span>
        </div>
        <div className="sv-book-side sv-book-side--bids">
          <div className="sv-book-row">
            <span>32.38</span>
            <span>180</span>
            <span className="sv-bar" style={{ width: "38%" }} />
          </div>
          <div className="sv-book-row">
            <span>32.35</span>
            <span>420</span>
            <span className="sv-bar" style={{ width: "82%" }} />
          </div>
          <div className="sv-book-row">
            <span>32.33</span>
            <span>96</span>
            <span className="sv-bar" style={{ width: "22%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
