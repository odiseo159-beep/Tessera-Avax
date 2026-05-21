import Link from "next/link";

import {
  listReports,
  isWavyConfigured,
  type WavyReportRecord,
} from "@/lib/wavy-client";
import {
  getDemoReports,
  isDemoModeEnabled,
  type DemoReport,
} from "@/lib/wavy-demo-data";

interface CountryEntry {
  code: "MX" | "CO" | "SV" | "GT";
  label: string;
  regulator: string;
  framework: string;
}

const COUNTRIES: CountryEntry[] = [
  {
    code: "MX",
    label: "México",
    regulator: "SAT · SPPLD",
    framework: "LFPIORPI",
  },
  {
    code: "CO",
    label: "Colombia",
    regulator: "UIAF",
    framework: "Resolución 314/2021",
  },
  {
    code: "SV",
    label: "El Salvador",
    regulator: "UIF · Fiscalía",
    framework: "Ley contra el Lavado de Dinero",
  },
  {
    code: "GT",
    label: "Guatemala",
    regulator: "IVE · SIB",
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

type Mode =
  | { kind: "ok"; reports: WavyReportRecord[] }
  | { kind: "demo"; reports: DemoReport[] }
  | { kind: "not_configured" }
  | { kind: "error"; message: string };

export default async function ComplianceReportsPage({ searchParams }: PageProps) {
  const country = resolveCountry(searchParams.country);
  const period = searchParams.period ?? currentPeriod();

  // Resolve the mode server-side. Three honest states:
  //   ok            → real Wavy data
  //   demo          → mock data, banner inocultable
  //   not_configured → no key, no demo flag, render setup banner
  let mode: Mode;
  if (isWavyConfigured()) {
    try {
      const reports = await listReports({ countryCode: country.code, period, limit: 25 });
      mode = { kind: "ok", reports: Array.isArray(reports) ? reports : [] };
    } catch (err) {
      mode = { kind: "error", message: err instanceof Error ? err.message : String(err) };
    }
  } else if (isDemoModeEnabled()) {
    mode = { kind: "demo", reports: getDemoReports(country.code, period) };
  } else {
    mode = { kind: "not_configured" };
  }

  return (
    <div className="page">
      <div className="kyc-wrap" style={{ maxWidth: 980 }}>
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          compliance · Wavy Node
        </div>
        <h1 className="ph-h1">Reportes regulatorios</h1>
        <p className="ph-lede">
          Reportes auto-generados a partir de la actividad on-chain monitoreada
          por Wavy Node. Cuatro jurisdicciones cubiertas: México (LFPIORPI),
          Colombia (UIAF), El Salvador (UIF), Guatemala (IVE).
        </p>

        {mode.kind === "demo" && <DemoBanner />}

        <CountrySwitcher selected={country.code} period={period} />

        <div className="report-context">
          <Row k="jurisdicción" v={`${country.label} · ${country.code}`} />
          <Row k="regulador" v={country.regulator} />
          <Row k="marco" v={country.framework} />
          <Row k="periodo" v={period} />
        </div>

        {mode.kind === "not_configured" && (
          <NotConfiguredBanner country={country.code} period={period} />
        )}

        {mode.kind === "error" && (
          <p style={{ color: "var(--destructive)", marginTop: 16, fontSize: 13 }}>
            {mode.message}
          </p>
        )}

        {mode.kind === "demo" && (
          <ReportList reports={mode.reports} country={country.code} period={period} />
        )}

        {mode.kind === "ok" && (
          <LiveReportList reports={mode.reports} country={country.code} period={period} />
        )}

        <p className="report-fineprint">
          Wavy Node emite un reporte cuando un usuario monitoreado excede el
          umbral mensual de su jurisdicción (México: 645,000 MXN ≈ $35k USD para
          AOR). Tessera entrega los datos vía endpoint HMAC-firmado configurado en
          el dashboard de Wavy.
        </p>
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="demo-banner" role="status">
      <span className="demo-banner-tag">DEMO</span>
      <div className="demo-banner-text">
        <strong>Datos sintéticos para demostración.</strong>{" "}
        Esperando API key de Wavy Node — la conexión está cableada de extremo a
        extremo y reemplazará automáticamente estos reportes cuando llegue. Los
        montos, folios y user IDs no corresponden a operaciones reales.
      </div>
    </div>
  );
}

function CountrySwitcher({ selected, period }: { selected: string; period: string }) {
  return (
    <div className="report-tabs">
      {COUNTRIES.map((c) => {
        const active = c.code === selected;
        return (
          <Link
            key={c.code}
            href={`/admin/reports?country=${c.code}&period=${period}`}
            className={`report-tab ${active ? "is-active" : ""}`}
          >
            <span className="report-tab-code mono">{c.code}</span>
            <span className="report-tab-label">{c.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ReportList({
  reports,
  country,
  period,
}: {
  reports: DemoReport[];
  country: string;
  period: string;
}) {
  if (reports.length === 0) {
    return (
      <p className="report-empty">
        Sin reportes en {period} para {country}. Wavy Node los emite cuando un
        usuario monitoreado excede el umbral mensual de su jurisdicción.
      </p>
    );
  }
  return (
    <ul className="report-grid">
      {reports.map((r) => (
        <ReportCard key={r.id} r={r} />
      ))}
    </ul>
  );
}

function LiveReportList({
  reports,
  country,
  period,
}: {
  reports: WavyReportRecord[];
  country: string;
  period: string;
}) {
  if (reports.length === 0) {
    return (
      <p className="report-empty">
        Sin reportes en {period} para {country}. Wavy Node los emite cuando un
        usuario monitoreado excede el umbral mensual de su jurisdicción.
      </p>
    );
  }
  // Live shape isn't fully documented in the Wavy llms.txt dump — render as
  // monospace cards until we have a real example to type against.
  return (
    <ul className="report-grid">
      {reports.map((r, i) => (
        <li key={i} className="report-card report-card--raw">
          <pre>{JSON.stringify(r, null, 2)}</pre>
        </li>
      ))}
    </ul>
  );
}

function ReportCard({ r }: { r: DemoReport }) {
  return (
    <li className={`report-card report-card--${r.riskLevel} report-card--${r.status}`}>
      <div className="report-card-head">
        <span className={`report-type report-type--${r.type.toLowerCase()}`}>
          {r.type}
        </span>
        <StatusPill status={r.status} />
        <span className={`risk-chip risk-chip--${r.riskLevel}`}>
          <span className="risk-chip-dot" />
          {r.riskLevel} · {r.riskScore}/100
        </span>
      </div>

      <h3 className="report-title">{r.typeLabel}</h3>
      <div className="report-ref mono">{r.regulatoryRef}</div>

      <div className="report-body">
        <Field k="usuario" v={r.userId} mono />
        <Field
          k="operaciones"
          v={`${r.operationsCount} · ${formatAmount(r.totalAmountUsd)} ${r.currency}`}
        />
        <Field
          k="enviado"
          v={r.submittedAt ? formatDate(r.submittedAt) : "—"}
          mono={!!r.submittedAt}
        />
      </div>

      <div className="report-card-foot mono">{r.id}</div>
    </li>
  );
}

function StatusPill({ status }: { status: DemoReport["status"] }) {
  const label = {
    submitted: "enviado",
    draft: "borrador",
    pending_review: "en revisión",
  }[status];
  return <span className={`status-pill status-pill--${status}`}>{label}</span>;
}

function Field({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="report-field">
      <span className="report-field-k">{k}</span>
      <span className={`report-field-v ${mono ? "mono" : ""}`}>{v}</span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="report-context-row">
      <span className="report-context-k">{k}</span>
      <span className="report-context-v">{v}</span>
    </div>
  );
}

function NotConfiguredBanner({ country, period }: { country: string; period: string }) {
  return (
    <div className="report-empty-state">
      <strong>Integración lista — esperando API key de Wavy Node.</strong>
      <p>
        El servidor está cableado para llamar a{" "}
        <code>GET /v1/reports?countryCode={country}&period={period}</code> en
        cuanto se reciba la key. Para mostrar data sintética en el demo,{" "}
        define <code>WAVY_DEMO_MODE=true</code> en{" "}
        <code>.env.local</code>.
      </p>
      <div className="report-env-hint mono">
        <div>WAVY_API_BASE    https://api.wavynode.com/v1</div>
        <div>WAVY_API_KEY     (pegar aquí cuando llegue)</div>
        <div>WAVY_PROJECT_ID  (pegar aquí cuando llegue)</div>
      </div>
    </div>
  );
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}
