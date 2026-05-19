import Link from "next/link";

import {
  listReports,
  isWavyConfigured,
  type WavyReportRecord,
} from "@/lib/wavy-client";

interface CountryEntry {
  code: string;
  label: string;
  regulator: string;
  framework: string;
}

const COUNTRIES: CountryEntry[] = [
  {
    code: "MX",
    label: "México",
    regulator: "SAT · SPPLD",
    framework: "LFPIORPI (Ley Federal de Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita)",
  },
  {
    code: "CO",
    label: "Colombia",
    regulator: "UIAF",
    framework: "Resolución 314/2021 — supervisión de PSAV",
  },
  {
    code: "SV",
    label: "El Salvador",
    regulator: "UIF · Fiscalía",
    framework: "Ley contra el Lavado de Dinero y de Activos",
  },
  {
    code: "GT",
    label: "Guatemala",
    regulator: "IVE · Superintendencia de Bancos",
    framework: "Ley contra el Lavado de Dinero u Otros Activos",
  },
];

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function resolveCountry(code: string | undefined): CountryEntry {
  return COUNTRIES.find((c) => c.code === code?.toUpperCase()) ?? COUNTRIES[0];
}

interface PageProps {
  searchParams: { country?: string; period?: string };
}

export default async function ComplianceReportsPage({ searchParams }: PageProps) {
  const country = resolveCountry(searchParams.country);
  const period = searchParams.period ?? currentPeriod();

  // Fetch reports server-side. The client distinguishes three states:
  // (a) configured → real data, (b) not configured → "awaiting key"
  // banner, (c) error → red note. Never fabricate data.
  let mode: "ok" | "not_configured" | "error" = "ok";
  let reports: WavyReportRecord[] = [];
  let errorMessage: string | null = null;
  if (!isWavyConfigured()) {
    mode = "not_configured";
  } else {
    try {
      reports = await listReports({ countryCode: country.code, period, limit: 25 });
    } catch (err) {
      mode = "error";
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  return (
    <div className="page">
      <div className="kyc-wrap" style={{ maxWidth: 920 }}>
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          compliance · Wavy Node
        </div>
        <h1 className="ph-h1">Reportes regulatorios</h1>
        <p className="ph-lede">
          Reportes auto-generados a partir de la actividad on-chain monitoreada
          por Wavy Node. Cuatro jurisdicciones cubiertas: México (LFPIORPI),
          Colombia (UIAF), El Salvador (UIF) y Guatemala (IVE).
        </p>

        <CountrySwitcher selected={country.code} period={period} />

        <div
          style={{
            marginTop: 18,
            padding: "16px 18px",
            background: "var(--bg-warm)",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            display: "grid",
            gap: 8,
            fontSize: 13,
          }}
        >
          <Row k="jurisdicción" v={`${country.label} · ${country.code}`} />
          <Row k="regulador" v={country.regulator} />
          <Row k="marco" v={country.framework} />
          <Row k="periodo" v={period} />
        </div>

        {mode === "not_configured" && (
          <NotConfiguredBanner country={country.code} period={period} />
        )}

        {mode === "error" && (
          <p style={{ color: "var(--destructive)", marginTop: 16, fontSize: 13 }}>
            {errorMessage}
          </p>
        )}

        {mode === "ok" && reports.length === 0 && (
          <p style={{ marginTop: 24, color: "var(--fg-soft)" }}>
            Sin reportes en {period} para {country.code}. Wavy Node los emite
            cuando un usuario monitoreado excede el umbral mensual de su
            jurisdicción.
          </p>
        )}

        {mode === "ok" && reports.length > 0 && (
          <ul
            style={{
              marginTop: 24,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 8,
            }}
          >
            {reports.map((r, i) => (
              <li
                key={i}
                style={{
                  padding: 14,
                  background: "var(--card)",
                  border: "0.5px solid var(--border)",
                  borderRadius: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {JSON.stringify(r, null, 2)}
              </li>
            ))}
          </ul>
        )}

        <p
          style={{
            marginTop: 28,
            fontSize: 12,
            color: "var(--fg-faint)",
            lineHeight: 1.6,
          }}
        >
          Wavy Node genera un reporte cuando un usuario excede el umbral de su
          jurisdicción durante el mes (México: 210 UMAs ≈ $24,635 MXN). Tessera
          entrega los datos del usuario via endpoint HMAC-firmado configurado en
          el dashboard de Wavy.
        </p>
      </div>
    </div>
  );
}

function CountrySwitcher({
  selected,
  period,
}: {
  selected: string;
  period: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 8,
        marginTop: 18,
        padding: 4,
        background: "var(--bg-warm)",
        border: "0.5px solid var(--border)",
        borderRadius: 10,
      }}
    >
      {COUNTRIES.map((c) => {
        const active = c.code === selected;
        return (
          <Link
            key={c.code}
            href={`/admin/reports?country=${c.code}&period=${period}`}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
              background: active ? "var(--card)" : "transparent",
              color: active ? "var(--fg)" : "var(--fg-soft)",
              border: active ? "0.5px solid var(--border)" : "0.5px solid transparent",
            }}
          >
            {c.code} · {c.label}
          </Link>
        );
      })}
    </div>
  );
}

function NotConfiguredBanner({
  country,
  period,
}: {
  country: string;
  period: string;
}) {
  return (
    <div
      style={{
        marginTop: 24,
        padding: "20px 22px",
        background: "var(--card)",
        border: "0.5px dashed var(--border)",
        borderRadius: 12,
      }}
    >
      <strong style={{ fontSize: 14 }}>
        Integración lista — esperando API key de Wavy Node.
      </strong>
      <p style={{ color: "var(--fg-soft)", marginTop: 8, fontSize: 13, lineHeight: 1.55 }}>
        El servidor está cableado para llamar a{" "}
        <code style={{ fontFamily: "var(--font-mono)" }}>
          GET /v1/reports?countryCode={country}&period={period}
        </code>{" "}
        en cuanto se reciba la key. Solicítala en{" "}
        <a
          href="https://wavynode.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--primary)", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          wavynode.com
        </a>
        .
      </p>
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gap: 6,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--fg-faint)",
        }}
      >
        <span>WAVY_API_BASE    https://api.wavynode.com/v1</span>
        <span>WAVY_API_KEY     (pegar aquí cuando llegue)</span>
        <span>WAVY_PROJECT_ID  (pegar aquí cuando llegue)</span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 12,
        color: "var(--fg-soft)",
        fontFamily: "var(--font-mono)",
      }}
    >
      <span
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontSize: 10,
          color: "var(--fg-faint)",
        }}
      >
        {k}
      </span>
      <span style={{ color: "var(--fg)" }}>{v}</span>
    </div>
  );
}
