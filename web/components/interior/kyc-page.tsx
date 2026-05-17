"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useKycStatus } from "@/hooks/use-kyc-status";
import { useMintUsdc } from "@/hooks/use-mint-usdc";
import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";
import { shortAddress } from "@/lib/format";

type Step = 0 | 1 | 2 | 3;
const TOTAL = 3;

interface FormData {
  name: string;
  country: string;
  birthdate: string;
  taxId: string;
  email: string;
  docType: string;
  docExpiry: string;
  docCountry: string;
}

const COUNTRIES = [
  { code: "MX", label: "México" },
  { code: "CO", label: "Colombia" },
  { code: "AR", label: "Argentina" },
  { code: "BR", label: "Brasil" },
  { code: "CL", label: "Chile" },
  { code: "PE", label: "Perú" },
  { code: "UY", label: "Uruguay" },
];

export function KycPage() {
  const { address, isConnected } = useAccount();
  const { state: kycState } = useKycStatus();
  const mint = useMintUsdc();

  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    country: "MX",
    birthdate: "",
    taxId: "",
    email: "",
    docType: "INE · frente y reverso",
    docExpiry: "",
    docCountry: "MX",
  });

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const next = () => {
    setError(null);
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.country) {
        setError("Completa todos los campos");
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        setError("Email inválido");
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      void submit();
    }
  };

  const back = () => {
    setError(null);
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  const submit = async () => {
    if (!address) {
      setError("Conecta tu wallet primero");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: address, country: form.country }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "La verificación falló");
        setSubmitting(false);
        return;
      }
      setTxHash(data.txHash ?? null);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="page">
        <div className="kyc-wrap">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            KYC · IdentityRegistry
          </div>
          <h1 className="ph-h1">Conecta tu wallet para empezar la verificación.</h1>
          <p className="ph-lede">
            La address que conectes queda atestada on-chain — sirve para Tessera
            Private y Public.
          </p>
          <div style={{ marginTop: 16 }}>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (kycState === "verified" && step !== 3) {
    return (
      <div className="page">
        <div className="kyc-wrap">
          <div className="eyebrow">
            <span className="eyebrow-dot" style={{ background: "var(--primary)" }} />
            KYC verificado
          </div>
          <h1 className="ph-h1">Tu wallet ya está atestada en el registry.</h1>
          <p className="ph-lede">
            {address && shortAddress(address)} ya tiene permiso ERC-3643. Puedes
            operar en ambos universos sin re-onboard.
          </p>
          <div style={{ display: "inline-flex", gap: 10, marginTop: 16 }}>
            <Link className="btn btn--primary" href="/private">
              Entrar a Private
            </Link>
            <Link className="btn" href="/public">
              Entrar a Public
            </Link>
            <button
              type="button"
              className="btn"
              onClick={() => mint.mint()}
              disabled={mint.state === "minting"}
            >
              {mint.state === "minting" ? "Minteando…" : "Reclamar 10k USDC mock"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="kyc-wrap">
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          <span className="eyebrow-dot" />
          KYC · IdentityRegistry
        </div>
        <h1 className="ph-h1" style={{ marginTop: 4 }}>
          Verifica una vez. {step >= TOTAL ? "Listo." : "Opera en ambos universos."}
        </h1>
        <p className="ph-lede" style={{ marginBottom: 28 }}>
          Tu identidad se registra una sola vez en{" "}
          <span className="lede-mono">IdentityRegistry</span> on-chain. Después,
          los tokens privados y públicos respetan el mismo permiso en cada
          transferencia — sin re-onboard.
        </p>

        <div className="kyc-stepper" aria-label="progreso">
          <StepChip
            n="01"
            l="Datos"
            state={step > 0 ? "done" : step === 0 ? "active" : "pending"}
          />
          <Rule filled={step > 0} />
          <StepChip
            n="02"
            l="Documento"
            state={step > 1 ? "done" : step === 1 ? "active" : "pending"}
          />
          <Rule filled={step > 1} />
          <StepChip
            n="03"
            l="On-chain"
            state={step > 2 ? "done" : step === 2 ? "active" : "pending"}
          />
        </div>

        <div className="kyc-panel">
          {step === 0 && <StepData form={form} update={update} />}
          {step === 1 && <StepDoc form={form} update={update} />}
          {step === 2 && <StepConfirm form={form} address={address} />}
          {step === 3 && <StepSuccess txHash={txHash} mint={mint} />}

          {error && (
            <p style={{ color: "var(--destructive)", fontSize: 12, marginTop: 12 }}>{error}</p>
          )}

          {step < TOTAL && (
            <div className="kyc-foot">
              <span className="meta">
                paso {step + 1} de {TOTAL} · ~{step === 0 ? "30s" : step === 1 ? "1 min" : "2 min de gas"}
              </span>
              <div className="kyc-btn-row">
                {step > 0 && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={back}
                    disabled={submitting}
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={next}
                  disabled={submitting}
                >
                  {submitting
                    ? "Verificando…"
                    : step === 2
                      ? "Firmar y registrar"
                      : "Continuar"}
                  <span style={{ marginLeft: 4 }}>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepChip({
  n,
  l,
  state,
}: {
  n: string;
  l: string;
  state: "done" | "active" | "pending";
}) {
  return (
    <div
      className={`kyc-step ${
        state === "done" ? "is-done" : state === "active" ? "is-active" : ""
      }`}
    >
      <span className="kyc-step-n">
        {state === "done" ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5l2.4 2.4 4.6-4.8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          n
        )}
      </span>
      <span className="kyc-step-l">{l}</span>
    </div>
  );
}

function Rule({ filled }: { filled: boolean }) {
  return (
    <div className={`kyc-step-rule ${filled ? "is-filled" : ""}`}>
      <span className="fill" />
    </div>
  );
}

function StepData({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div className="kyc-step-content">
      <div className="kyc-eyebrow">paso 01 · datos personales</div>
      <h2 className="kyc-h">¿Quién eres?</h2>
      <p className="kyc-sub">
        Solo lo necesario para cumplir con el issuer LatAm y con Dinari. Nada se
        publica on-chain — solo el hash de tu identidad.
      </p>
      <div className="kyc-fields">
        <div className="kyc-field">
          <label className="kyc-field-label">Nombre legal</label>
          <input
            className="kyc-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="María González"
          />
        </div>
        <div className="kyc-field">
          <label className="kyc-field-label">País de residencia</label>
          <select
            className="kyc-input"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="kyc-field">
          <label className="kyc-field-label">Fecha de nacimiento</label>
          <input
            className="kyc-input"
            type="date"
            value={form.birthdate}
            onChange={(e) => update("birthdate", e.target.value)}
          />
        </div>
        <div className="kyc-field">
          <label className="kyc-field-label">RFC / Tax ID</label>
          <input
            className="kyc-input"
            value={form.taxId}
            onChange={(e) => update("taxId", e.target.value)}
            placeholder="GOMM920418H73"
          />
        </div>
        <div className="kyc-field full">
          <label className="kyc-field-label">Email</label>
          <input
            className="kyc-input"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="maria@ejemplo.mx"
          />
        </div>
      </div>
    </div>
  );
}

function StepDoc({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div className="kyc-step-content">
      <div className="kyc-eyebrow">paso 02 · documento</div>
      <h2 className="kyc-h">Sube un documento oficial</h2>
      <p className="kyc-sub">
        INE, pasaporte o cédula. El issuer del SecurityToken valida y firma —
        Tessera no almacena la imagen.
      </p>
      <label className="kyc-doc-drop" htmlFor="kyc-file">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
          <rect
            x="3.5"
            y="4.5"
            width="17"
            height="15"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="14" r="1.6" fill="currentColor" />
          <path
            d="M12 16l2-2 3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          Arrastra tu documento aquí o <strong>busca un archivo</strong>
        </div>
        <div className="mono">PDF · PNG · JPG · máx 8 MB</div>
        <input id="kyc-file" type="file" accept="image/*,application/pdf" style={{ display: "none" }} />
      </label>
      <div className="kyc-fields" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="kyc-field">
          <label className="kyc-field-label">Tipo</label>
          <input
            className="kyc-input"
            value={form.docType}
            onChange={(e) => update("docType", e.target.value)}
          />
        </div>
        <div className="kyc-field">
          <label className="kyc-field-label">Vigencia</label>
          <input
            className="kyc-input"
            type="date"
            value={form.docExpiry}
            onChange={(e) => update("docExpiry", e.target.value)}
          />
        </div>
        <div className="kyc-field">
          <label className="kyc-field-label">País emisor</label>
          <input
            className="kyc-input"
            value={form.docCountry}
            onChange={(e) => update("docCountry", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function StepConfirm({
  form,
  address,
}: {
  form: FormData;
  address: `0x${string}` | undefined;
}) {
  const registryShort =
    contractAddresses.identityRegistry !== ZERO_ADDRESS
      ? shortAddress(contractAddresses.identityRegistry)
      : "0x4d69…Ea96";
  return (
    <div className="kyc-step-content">
      <div className="kyc-eyebrow">paso 03 · registro on-chain</div>
      <h2 className="kyc-h">Firma con tu wallet</h2>
      <p className="kyc-sub">
        Esta transacción agrega tu address a{" "}
        <span className="lede-mono">IdentityRegistry</span> en Avalanche Fuji.
        Es la única vez que firmas — después, cualquier token ERC-3643 reconoce
        tu permiso automáticamente.
      </p>
      <div
        style={{
          display: "grid",
          gap: 10,
          padding: "14px 16px",
          background: "var(--bg-warm)",
          border: "0.5px solid var(--border)",
          borderRadius: 10,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        <Row k="registry" v={registryShort} />
        <Row k="method" v="addIdentity(address,string)" />
        <Row k="country" v={form.country} />
        <Row k="chain" v="Avalanche Fuji · 43113" />
        <Row k="gas" v="≈ 0.0001 AVAX (server-side)" />
      </div>
      <div
        style={{
          display: "inline-flex",
          gap: 8,
          fontSize: 12,
          color: "var(--fg-faint)",
          marginTop: 4,
        }}
      >
        <span className="pol-dot is-live" />
        wallet conectada · {address ? shortAddress(address) : "—"}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, color: "var(--fg-soft)" }}>
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

function rng(seedStart: number) {
  let s = seedStart;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function StepSuccess({
  txHash,
  mint,
}: {
  txHash: string | null;
  mint: ReturnType<typeof useMintUsdc>;
}) {
  const shards = useMemo(() => {
    const out: Array<{
      cx: number;
      cy: number;
      cr: number;
      bg: string;
      l: number;
      t: number;
    }> = [];
    const r = rng(99);
    const colors = ["#0F6E56", "#3C3489", "#1A1D21", "#D3D1C7"];
    for (let i = 0; i < 14; i++) {
      const angle = r() * Math.PI * 2;
      const dist = 80 + r() * 80;
      out.push({
        cx: Math.cos(angle) * dist,
        cy: Math.sin(angle) * dist - 20,
        cr: (r() - 0.5) * 540,
        bg: colors[Math.floor(r() * colors.length)],
        l: 50 + (r() - 0.5) * 12,
        t: 50 + (r() - 0.5) * 12,
      });
    }
    return out;
  }, []);

  return (
    <div className="kyc-step-content kyc-success">
      <div className="kyc-eyebrow">listo</div>
      <h2 className="kyc-h">Identidad registrada on-chain.</h2>
      <p className="kyc-sub" style={{ textAlign: "center" }}>
        Tu address ya tiene permiso para operar en Tessera Private y Tessera Public.
      </p>
      {txHash && (
        <a
          className="link"
          href={`https://testnet.snowtrace.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--fg-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          ver tx en Snowtrace<span className="link-arrow"> ↗</span>
        </a>
      )}
      <div style={{ position: "relative", marginTop: 8 }}>
        <div className="kyc-check">
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <path className="path" d="M11 24l8 8 16-18" />
          </svg>
        </div>
        <div className="kyc-confetti">
          {shards.map((s, i) => (
            <i
              key={i}
              style={{
                left: `${s.l}%`,
                top: `${s.t}%`,
                background: s.bg,
                animationDelay: `${350 + i * 18}ms`,
                ["--cx" as string]: `${s.cx}px`,
                ["--cy" as string]: `${s.cy}px`,
                ["--cr" as string]: `${s.cr}deg`,
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          className="kyc-claim"
          onClick={() => mint.mint()}
          disabled={mint.state === "minting"}
        >
          <span>{mint.state === "minting" ? "Minteando…" : "Reclama tu mock"}</span>
          <span className="amount">10,000 USDC</span>
        </button>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-faint)" }}>
          solo en Fuji testnet · no es asesoría financiera
        </span>
      </div>

      <div style={{ display: "inline-flex", gap: 10, marginTop: 8 }}>
        <Link className="btn" href="/private">
          Entrar a Private
        </Link>
        <Link className="btn" href="/public">
          Entrar a Public
        </Link>
      </div>
    </div>
  );
}
