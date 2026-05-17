"use client";

interface Step {
  n: string;
  t: string;
  d: string;
  k: string;
}

const STEPS: Step[] = [
  {
    n: "01",
    t: "Conecta",
    d: "Cualquier wallet EVM. RainbowKit + wagmi en Avalanche Fuji.",
    k: "wagmi · ~10s",
  },
  {
    n: "02",
    t: "Verifica",
    d: "KYC una sola vez. Tu address queda registrada en IdentityRegistry on-chain.",
    k: "ERC-3643 · ~2 min",
  },
  {
    n: "03",
    t: "Opera",
    d: "Coloca y cancela órdenes en el mismo orderbook para Private y Public.",
    k: "fill atómico · ~3s",
  },
];

export function HowItWorks() {
  return (
    <section className="how">
      <div className="eyebrow">
        <span className="eyebrow-dot" />
        Cómo funciona
      </div>
      <h2 className="how-title">Tres pasos. Una sola identidad.</h2>
      <div className="how-grid">
        {STEPS.map((s) => (
          <div className="how-step" key={s.n}>
            <div className="how-step-head">
              <span className="how-n">{s.n}</span>
              <span className="how-rule" />
              <span className="how-k mono">{s.k}</span>
            </div>
            <h3 className="how-step-t">{s.t}</h3>
            <p className="how-step-d">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
