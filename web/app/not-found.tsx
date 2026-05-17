import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div
        className="page-inner"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: 720,
        }}
      >
        <div className="eyebrow">
          <span className="eyebrow-dot eyebrow-dot--red" />
          404 · pieza fuera del tablero
        </div>
        <h1 className="ph-h1">Esa página no existe en este universo.</h1>
        <p className="ph-lede">
          Probablemente un link viejo del demo. Vuelve al inicio o entra a uno
          de los dos marketplaces.
        </p>
        <div style={{ display: "inline-flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Link className="btn btn--primary" href="/">
            Volver al inicio<span style={{ marginLeft: 4 }}>→</span>
          </Link>
          <Link className="btn" href="/private">
            <span className="pol-dot" style={{ background: "var(--primary)" }} /> Private
          </Link>
          <Link className="btn" href="/public">
            <span className="pol-dot" style={{ background: "var(--accent)" }} /> Public
          </Link>
        </div>
      </div>
    </div>
  );
}
