"use client";

import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";

export function TesseraFooter() {
  const orderbookHref =
    contractAddresses.orderbook !== ZERO_ADDRESS
      ? `https://testnet.snowtrace.io/address/${contractAddresses.orderbook}`
      : "https://testnet.snowtrace.io";

  return (
    <footer className="site-footer">
      <div className="foot-inner">
        <div className="foot-brand">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-a" />
            <span className="brand-mark-b" />
          </span>
          <span className="brand-name">Tessera</span>
          <span className="foot-tag">· Avalanche LatAm Institucional 2026</span>
        </div>
        <div className="foot-links">
          <a href="/admin/reports">
            Compliance
          </a>
          <a href={orderbookHref} target="_blank" rel="noopener noreferrer">
            Snowtrace<span className="link-arrow">↗</span>
          </a>
          <a href="https://docs.dinari.com" target="_blank" rel="noopener noreferrer">
            Dinari<span className="link-arrow">↗</span>
          </a>
          <a href="https://docs.wavynode.com" target="_blank" rel="noopener noreferrer">
            Wavy Node<span className="link-arrow">↗</span>
          </a>
          <a
            href="https://build.avax.network/events/8a8ee2e9-d91d-4087-adba-c1221b72e407"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hackathon<span className="link-arrow">↗</span>
          </a>
        </div>
      </div>
      <div className="foot-fine">
        <span className="mono">chainId 43113 · build tessera · fuji</span>
        <span>Sandbox — no es asesoría financiera. Para fines de demostración del hackathon.</span>
      </div>
    </footer>
  );
}
