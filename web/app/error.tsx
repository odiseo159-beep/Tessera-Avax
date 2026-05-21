"use client";

/// Route-segment error boundary. Required by Next 14 App Router —
/// without it, any render error during dev shows the
/// "missing required error components, refreshing..." spinner loop
/// instead of the actual stack.
///
/// In production we render a Tessera-styled fallback with a Reset
/// button. In dev, the inline error.digest + message helps catch
/// the underlying issue before users see anything.

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Surface the error in the browser console with enough context to
    // debug. .digest is the server-side error fingerprint Next exposes
    // when the real message is hidden from the client.
    console.error("Tessera ErrorBoundary:", {
      name: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="page">
      <div className="kyc-wrap" style={{ maxWidth: 640 }}>
        <div className="eyebrow">
          <span className="eyebrow-dot" style={{ background: "var(--destructive)" }} />
          error
        </div>
        <h1 className="ph-h1">Algo se rompió en esta vista.</h1>
        <p className="ph-lede">
          {error.message ||
            "Un error inesperado interrumpió la renderización. Intenta de nuevo o vuelve al inicio."}
          {error.digest && (
            <span
              className="mono"
              style={{
                display: "block",
                marginTop: 12,
                fontSize: 11,
                color: "var(--fg-faint)",
              }}
            >
              digest · {error.digest}
            </span>
          )}
        </p>
        <div style={{ display: "inline-flex", gap: 10, marginTop: 20 }}>
          <button type="button" className="btn btn--primary" onClick={() => reset()}>
            Reintentar
          </button>
          <Link href="/" className="btn">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
