"use client";

/// Root-level error boundary. Renders only when the error escaped
/// `app/error.tsx` — i.e. the layout itself blew up. Must include its
/// own `<html>` and `<body>` because the root layout is what failed.
///
/// Kept deliberately bare-bones: no Tessera CSS bundle (the failure
/// might be in there), only inline styles. This is the absolute last
/// resort fallback.

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#F1EFE8",
          color: "#1A1D21",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#C03737",
              marginBottom: 12,
            }}
          >
            error global
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              lineHeight: 1.1,
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            La aplicación no pudo cargarse.
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              color: "#5C6066",
              margin: "0 0 20px",
            }}
          >
            {error.message ||
              "Un error inesperado evitó que la app se montara."}
            {error.digest && (
              <span
                style={{
                  display: "block",
                  marginTop: 10,
                  fontSize: 11,
                  color: "#888",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              >
                digest · {error.digest}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 18px",
              background: "#1A1D21",
              color: "#F1EFE8",
              border: 0,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
