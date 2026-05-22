import Link from "next/link";

import { contractAddresses, ZERO_ADDRESS } from "@/lib/contracts";

/// /compliance — public one-pager explaining Tessera's regulatory
/// posture. Pitch-grade supporting material for the Ledger Leaders
/// Week panel and any judge who wants to look up details after the
/// live demo.
///
/// No client interactivity, no data fetching. Pure server-rendered
/// markup so it works in any context (Vercel preview, production,
/// printed-as-PDF). Embeds the architecture.svg and links out to
/// /admin/reports for the live regulatory dashboard.

interface Jurisdiction {
  code: string;
  flag: string;
  country: string;
  regulator: string;
  framework: string;
  reportTypes: Array<{ type: string; label: string }>;
}

const JURISDICTIONS: Jurisdiction[] = [
  {
    code: "MX",
    flag: "🇲🇽",
    country: "México",
    regulator: "SAT · SPPLD",
    framework: "LFPIORPI · art. 17–19 (actividades vulnerables)",
    reportTypes: [
      { type: "AOR", label: "Aviso de Operación Relevante (> 645k MXN)" },
      { type: "AOI", label: "Aviso de Operación Inusual" },
      { type: "AOP", label: "Aviso de Operación Preocupante" },
    ],
  },
  {
    code: "CO",
    flag: "🇨🇴",
    country: "Colombia",
    regulator: "UIAF",
    framework: "Resolución 314 de 2021 · PSAV",
    reportTypes: [
      { type: "ROS", label: "Reporte de Operación Sospechosa" },
      { type: "ROT", label: "Reporte de Operación en Efectivo" },
    ],
  },
  {
    code: "SV",
    flag: "🇸🇻",
    country: "El Salvador",
    regulator: "UIF · Fiscalía",
    framework: "Ley contra el Lavado de Dinero y de Activos",
    reportTypes: [{ type: "ROS", label: "Reporte de Operación Sospechosa" }],
  },
  {
    code: "GT",
    flag: "🇬🇹",
    country: "Guatemala",
    regulator: "IVE · Superintendencia de Bancos",
    framework: "Ley contra el Lavado de Dinero u Otros Activos",
    reportTypes: [
      { type: "RTS", label: "Reporte de Transacción Sospechosa" },
    ],
  },
];

const ISSUER_FLOW: Array<{ n: string; t: string; d: string }> = [
  {
    n: "01",
    t: "Designación de issuer",
    d: "Una entidad regulada (broker-dealer, AFP, vehículo CKD / FIBRA-E, casa de bolsa) firma el acuerdo de issuer. Recibe el rol `agent` sobre el IdentityRegistry vía multisig de trustee.",
  },
  {
    n: "02",
    t: "Deploy del SecurityToken",
    d: "Hardhat deploy con los parámetros de la emisión: nombre, supply, lockup, identityRegistry address. El contrato hereda el _update gate ERC-3643 inmediatamente — sin posibilidad de transferencia a wallets no atestadas.",
  },
  {
    n: "03",
    t: "Onboarding de inversionistas",
    d: "Cada inversionista pasa KYC vía proveedor regulado (Persona / SumSub / Onfido). El issuer firma claims EIP-712 y los agrega al IdentityRegistry. Una verificación sirve para futuras emisiones del mismo issuer.",
  },
  {
    n: "04",
    t: "Settlement + reporting",
    d: "Las órdenes ejecutan contra el Orderbook compartido. Wavy Node monitorea cada wallet atestada y emite reportes mensuales por jurisdicción al regulador correspondiente. Tessera no toma custodia.",
  },
];

export default function CompliancePage() {
  const orderbookAddr =
    contractAddresses.orderbook !== ZERO_ADDRESS
      ? contractAddresses.orderbook
      : null;
  const registryAddr =
    contractAddresses.identityRegistry !== ZERO_ADDRESS
      ? contractAddresses.identityRegistry
      : null;

  return (
    <div className="page">
      <div className="kyc-wrap" style={{ maxWidth: 920 }}>
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          marco regulatorio
        </div>
        <h1 className="ph-h1">Compliance enforced en el bytecode.</h1>
        <p className="ph-lede">
          Tessera no agrega compliance como un wrapper alrededor del activo —
          lo pone <strong>dentro del token mismo</strong>. Cada transferencia
          se valida on-chain contra el IdentityRegistry vía el estándar
          ERC-3643. Si la wallet de destino no está atestada, la operación
          revierte en el bloque; no se necesita confiar en la UI ni en un
          backend que filtre.
        </p>

        <div className="comp-cta-row">
          <Link className="btn btn--primary" href="/admin/reports">
            Ver reportes en vivo
            <span aria-hidden="true" style={{ marginLeft: 6 }}>→</span>
          </Link>
          <a
            className="btn"
            href="/architecture.svg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Diagrama de arquitectura
            <span className="link-arrow"> ↗</span>
          </a>
        </div>

        <Section title="01 · Stack en cuatro capas">
          <p className="comp-p">
            Cada capa carga una responsabilidad regulatoria distinta. Las
            capas marcadas <em>shared</em> sirven a todos los activos sin
            duplicación — es lo que hace que una sola identidad on-chain
            habilite ambos universos.
          </p>
          <div className="comp-arch-wrap">
            <img src="/architecture.svg" alt="Arquitectura Tessera" />
          </div>
        </Section>

        <Section title="02 · Jurisdicciones cubiertas">
          <p className="comp-p">
            Wavy Node, partner del Hackathon LatAm Institucional, opera la
            capa de reporting automático. Cubre las cuatro jurisdicciones
            LatAm donde el marco AML ya define umbrales y formatos de reporte
            específicos.
          </p>
          <div className="comp-jur-grid">
            {JURISDICTIONS.map((j) => (
              <div key={j.code} className="comp-jur-card">
                <div className="comp-jur-head">
                  <span className="comp-jur-flag" aria-hidden="true">
                    {j.flag}
                  </span>
                  <div>
                    <div className="comp-jur-country">{j.country}</div>
                    <div className="comp-jur-code mono">{j.code}</div>
                  </div>
                </div>
                <div className="comp-jur-meta">
                  <div className="comp-jur-meta-row">
                    <span className="comp-jur-meta-k">regulador</span>
                    <span className="comp-jur-meta-v">{j.regulator}</span>
                  </div>
                  <div className="comp-jur-meta-row">
                    <span className="comp-jur-meta-k">marco</span>
                    <span className="comp-jur-meta-v">{j.framework}</span>
                  </div>
                </div>
                <ul className="comp-jur-reports">
                  {j.reportTypes.map((r) => (
                    <li key={r.type}>
                      <span className="comp-jur-type mono">{r.type}</span>
                      <span className="comp-jur-label">{r.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="03 · ERC-3643 en lenguaje no-técnico">
          <p className="comp-p">
            ERC-3643 es un estándar Ethereum (Tokeny, en producción con
            Securitize y BlackRock BUIDL) que codifica el concepto de{" "}
            <em>permissioned transfer</em>: cada token tiene una función
            override (<code className="mono">_update</code>) que verifica al
            destinatario contra un registro de identidad antes de mover los
            balances. El registro lo controla un agente (issuer / trustee),
            no el token; un agente puede agregar o remover wallets verificadas
            sin tocar el token mismo.
          </p>
          <p className="comp-p">
            Concretamente, en Tessera cada{" "}
            <code className="mono">transfer()</code>,{" "}
            <code className="mono">transferFrom()</code>, y{" "}
            <code className="mono">mint()</code> de un SecurityToken llama
            internamente a{" "}
            <code className="mono">
              IdentityRegistry.isVerified(to)
            </code>
            . Si retorna <code className="mono">false</code>, la operación
            revierte. No hay forma de bypasear desde la UI porque la guardia
            vive en el contrato — auditable por cualquiera en{" "}
            {registryAddr ? (
              <a
                className="link"
                href={`https://testnet.snowtrace.io/address/${registryAddr}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Snowtrace <span className="link-arrow">↗</span>
              </a>
            ) : (
              "Snowtrace"
            )}
            .
          </p>
        </Section>

        <Section title="04 · Cómo onboardearía un issuer regulado">
          <ol className="comp-flow">
            {ISSUER_FLOW.map((s) => (
              <li key={s.n} className="comp-flow-step">
                <span className="comp-flow-n mono">{s.n}</span>
                <div className="comp-flow-body">
                  <div className="comp-flow-t">{s.t}</div>
                  <p className="comp-flow-d">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="05 · Qué está mockeado en la versión del hackathon">
          <p className="comp-p">
            Por honestidad — porque los jueces preguntan y la respuesta corta
            «todo está mockeado» no es cierta:
          </p>
          <ul className="comp-mock-list">
            <li>
              <strong>KYC issuer</strong> — el deployer wallet firma claims
              en lugar de un proveedor regulado. La <em>topología</em> es la
              misma: en producción se reemplaza por Persona / SumSub /
              Onfido sin cambiar el contrato.
            </li>
            <li>
              <strong>USDC</strong> — usamos un{" "}
              <code className="mono">MockUSDC</code> propio (6 decimales,
              comportamiento ERC20 idéntico). En producción, USDC nativo
              de Circle en Avalanche.
            </li>
            <li>
              <strong>Public universe</strong> — los precios vienen del
              sandbox real de Dinari, pero el settlement es sintético en
              Fuji. La integración nativa Dinari/Avalanche llega cuando
              Dinari deploya en Avalanche (Q4 2026 esperado).
            </li>
            <li>
              <strong>Wavy Node</strong> — la integración está cableada de
              extremo a extremo (server-side client, hooks, /admin/reports),
              pero corre en modo demo hasta que llegue la API key real. Una
              vez puesta, el cambio es de un env var, no de código.
            </li>
            <li>
              <strong>Auditoría</strong> — los contratos pasan tests pero no
              han sido auditados por Halborn / OpenZeppelin. Es un pre-req
              para mainnet, no para hackathon demo.
            </li>
          </ul>
        </Section>

        <p className="comp-foot">
          ¿Preguntas legales o regulatorias específicas? Tessera está en el
          Top 3 del Hackathon LatAm Institucional. Contacto via{" "}
          {orderbookAddr ? (
            <a
              className="link"
              href={`https://testnet.snowtrace.io/address/${orderbookAddr}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Snowtrace <span className="link-arrow">↗</span>
            </a>
          ) : (
            "Snowtrace"
          )}
          {" · "}
          <Link href="/admin/reports" className="link">
            /admin/reports
          </Link>
          {" · "}
          <a
            className="link"
            href="https://docs.wavynode.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs.wavynode.com <span className="link-arrow">↗</span>
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="comp-section">
      <h2 className="comp-section-t">{title}</h2>
      {children}
    </section>
  );
}
