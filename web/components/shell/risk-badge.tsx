"use client";

import { useAccount } from "wagmi";
import { useRiskScore, type RiskLevel } from "@/hooks/use-risk-score";

const LEVEL_LABEL: Record<RiskLevel, string> = {
  verified: "Riesgo · verificado",
  minimal: "Riesgo · mínimo",
  low: "Riesgo · bajo",
  medium: "Riesgo · medio",
  high: "Riesgo · alto",
  critical: "Riesgo · crítico",
};

const LEVEL_CLASS: Record<RiskLevel, string> = {
  verified: "risk-pill--ok",
  minimal: "risk-pill--ok",
  low: "risk-pill--ok",
  medium: "risk-pill--warn",
  high: "risk-pill--danger",
  critical: "risk-pill--danger",
};

/// Shows the Wavy Node risk score next to the wallet button. Only
/// renders when a wallet is connected. Pre-key, surfaces "pendiente"
/// honestly — never fabricates a score.
export function RiskBadge() {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useRiskScore(address);

  if (!isConnected) return null;

  if (isLoading) {
    return (
      <span className="risk-pill risk-pill--pending" data-state="loading">
        <span className="risk-dot" />
        Riesgo · …
      </span>
    );
  }

  if (!data || data.status === "not_configured") {
    return (
      <span
        className="risk-pill risk-pill--pending"
        title="Wavy Node integration ready — esperando API key"
      >
        <span className="risk-dot" />
        Riesgo · pendiente
      </span>
    );
  }

  if (data.status === "no_data") {
    return (
      <span
        className="risk-pill risk-pill--pending"
        title="Sin actividad on-chain analizable"
      >
        <span className="risk-dot" />
        Riesgo · sin datos
      </span>
    );
  }

  const cls = LEVEL_CLASS[data.level];
  const label = LEVEL_LABEL[data.level];
  return (
    <span
      className={`risk-pill ${cls}`}
      title={`${data.score}/100 · ${data.reason}`}
    >
      <span className="risk-dot" />
      {label}
    </span>
  );
}
