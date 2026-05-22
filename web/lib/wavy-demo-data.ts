/// Server-only mock compliance reports. Surfaces realistic-looking
/// Wavy Node output for the pitch demo while the real API key is
/// pending. Each report carries `demo: true` so the UI can render an
/// unmissable badge — judges should never wonder if these are real.
///
/// Structure mirrors what Wavy returns in production: report type per
/// jurisdiction (AOR / AOI / AOP for MX, ROS / ROT for CO, etc.),
/// anonymized user identifier, aggregated operations, risk envelope,
/// and the regulatoryRef the auditor would file with.
///
/// Numbers chosen to read plausibly without naming any real entity:
/// thresholds match the LFPIORPI 645k MXN AOR floor, UIAF Resolución
/// 314 ROS triggers, etc.
import "server-only";

export interface DemoReport {
  id: string;
  type: string;
  typeLabel: string;
  period: string;
  countryCode: "MX" | "CO" | "SV" | "GT";
  status: "submitted" | "draft" | "pending_review";
  userId: string;
  operationsCount: number;
  totalAmountUsd: number;
  currency: string;
  riskScore: number;
  riskLevel: "minimal" | "low" | "medium" | "high";
  submittedAt: string | null;
  regulatoryRef: string;
  demo: true;
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function priorPeriod(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const NOW = Date.now();

function daysAgo(n: number): string {
  return new Date(NOW - n * 86_400_000).toISOString();
}

const PERIOD = currentPeriod();
const PRIOR = priorPeriod();

const MX: DemoReport[] = [
  {
    id: "wn_rep_01HMX4Z9KA0VBT5W2Q7P3D8E1F",
    type: "AOR",
    typeLabel: "Aviso de Operación Relevante",
    period: PERIOD,
    countryCode: "MX",
    status: "submitted",
    userId: "user_4a2e91c",
    operationsCount: 3,
    totalAmountUsd: 84_500,
    currency: "USDC",
    riskScore: 18,
    riskLevel: "low",
    submittedAt: daysAgo(2),
    regulatoryRef: "SAT-AOR-2026-04829",
    demo: true,
  },
  {
    id: "wn_rep_01HMX5A1Z8RTBCY7Q3P2H6N5J",
    type: "AOI",
    typeLabel: "Aviso de Operación Inusual",
    period: PERIOD,
    countryCode: "MX",
    status: "pending_review",
    userId: "user_91dfa02",
    operationsCount: 7,
    totalAmountUsd: 142_300,
    currency: "USDC",
    riskScore: 64,
    riskLevel: "medium",
    submittedAt: null,
    regulatoryRef: "SAT-AOI-2026-04861",
    demo: true,
  },
  {
    id: "wn_rep_01HMX6BR42TKWPC8V9Y4S3L7M",
    type: "AOR",
    typeLabel: "Aviso de Operación Relevante",
    period: PERIOD,
    countryCode: "MX",
    status: "submitted",
    userId: "user_b3c810e",
    operationsCount: 2,
    totalAmountUsd: 68_900,
    currency: "USDC",
    riskScore: 22,
    riskLevel: "low",
    submittedAt: daysAgo(5),
    regulatoryRef: "SAT-AOR-2026-04812",
    demo: true,
  },
  {
    id: "wn_rep_01HMW7CSXA0VDPRY3Q8N1K2L4",
    type: "AOP",
    typeLabel: "Aviso de Operación Preocupante",
    period: PRIOR,
    countryCode: "MX",
    status: "submitted",
    userId: "user_d7f2a14",
    operationsCount: 12,
    totalAmountUsd: 287_400,
    currency: "USDC",
    riskScore: 78,
    riskLevel: "high",
    submittedAt: daysAgo(18),
    regulatoryRef: "SAT-AOP-2026-04601",
    demo: true,
  },
];

const CO: DemoReport[] = [
  {
    id: "wn_rep_01HCO3X8RKVTBP2Q9Y4N7L1J5",
    type: "ROS",
    typeLabel: "Reporte de Operación Sospechosa",
    period: PERIOD,
    countryCode: "CO",
    status: "submitted",
    userId: "user_27e103a",
    operationsCount: 5,
    totalAmountUsd: 96_800,
    currency: "USDC",
    riskScore: 71,
    riskLevel: "high",
    submittedAt: daysAgo(3),
    regulatoryRef: "UIAF-ROS-2026-CO-01827",
    demo: true,
  },
  {
    id: "wn_rep_01HCO4Y9NPVDKM6W2S1L8P3T7",
    type: "ROT",
    typeLabel: "Reporte de Operación en Efectivo",
    period: PERIOD,
    countryCode: "CO",
    status: "submitted",
    userId: "user_8b4e207",
    operationsCount: 4,
    totalAmountUsd: 52_100,
    currency: "USDC",
    riskScore: 32,
    riskLevel: "low",
    submittedAt: daysAgo(6),
    regulatoryRef: "UIAF-ROT-2026-CO-01853",
    demo: true,
  },
  {
    id: "wn_rep_01HCO2Z6QXNPDM5VRB3J7K1L9",
    type: "ROS",
    typeLabel: "Reporte de Operación Sospechosa",
    period: PRIOR,
    countryCode: "CO",
    status: "submitted",
    userId: "user_c0a4b18",
    operationsCount: 9,
    totalAmountUsd: 178_650,
    currency: "USDC",
    riskScore: 58,
    riskLevel: "medium",
    submittedAt: daysAgo(22),
    regulatoryRef: "UIAF-ROS-2026-CO-01742",
    demo: true,
  },
];

const SV: DemoReport[] = [
  {
    id: "wn_rep_01HSV5A2KWVBT3Q9R6Y4N1L8M",
    type: "ROS",
    typeLabel: "Reporte de Operación Sospechosa",
    period: PERIOD,
    countryCode: "SV",
    status: "draft",
    userId: "user_e1f7d02",
    operationsCount: 3,
    totalAmountUsd: 41_200,
    currency: "USDC",
    riskScore: 49,
    riskLevel: "medium",
    submittedAt: null,
    regulatoryRef: "UIF-SV-2026-00328",
    demo: true,
  },
  {
    id: "wn_rep_01HSV3B7QXNCDP4V8Y2S6L1J9",
    type: "ROS",
    typeLabel: "Reporte de Operación Sospechosa",
    period: PRIOR,
    countryCode: "SV",
    status: "submitted",
    userId: "user_2c9b418",
    operationsCount: 6,
    totalAmountUsd: 88_400,
    currency: "USDC",
    riskScore: 67,
    riskLevel: "medium",
    submittedAt: daysAgo(28),
    regulatoryRef: "UIF-SV-2026-00301",
    demo: true,
  },
];

const GT: DemoReport[] = [
  {
    id: "wn_rep_01HGT4D8VPRTBM9Y2Q7N3K1L5",
    type: "RTS",
    typeLabel: "Reporte de Transacción Sospechosa",
    period: PERIOD,
    countryCode: "GT",
    status: "submitted",
    userId: "user_a8b2c13",
    operationsCount: 4,
    totalAmountUsd: 73_900,
    currency: "USDC",
    riskScore: 41,
    riskLevel: "medium",
    submittedAt: daysAgo(7),
    regulatoryRef: "IVE-GT-2026-RTS-00917",
    demo: true,
  },
  {
    id: "wn_rep_01HGT2C9KXVBPM8R5Y4N7L1J3",
    type: "RTS",
    typeLabel: "Reporte de Transacción Sospechosa",
    period: PRIOR,
    countryCode: "GT",
    status: "submitted",
    userId: "user_50f9e27",
    operationsCount: 8,
    totalAmountUsd: 124_500,
    currency: "USDC",
    riskScore: 55,
    riskLevel: "medium",
    submittedAt: daysAgo(31),
    regulatoryRef: "IVE-GT-2026-RTS-00874",
    demo: true,
  },
];

const BY_COUNTRY: Record<string, DemoReport[]> = { MX, CO, SV, GT };

export function getDemoReports(
  country: string,
  period: string,
): DemoReport[] {
  const all = BY_COUNTRY[country.toUpperCase()] ?? [];
  return all.filter((r) => r.period === period);
}

export function isDemoModeEnabled(): boolean {
  return process.env.WAVY_DEMO_MODE === "true";
}
