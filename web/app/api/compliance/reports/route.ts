import { NextRequest, NextResponse } from "next/server";
import {
  listReports,
  isWavyConfigured,
  WavyNotConfiguredError,
} from "@/lib/wavy-client";

const SUPPORTED_COUNTRIES = new Set(["MX", "CO", "SV", "GT"]);

function defaultPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/// GET /api/compliance/reports?country=MX&period=2026-05
///
/// Lists Wavy Node's auto-generated regulatory reports for the given
/// jurisdiction. Covers LFPIORPI (MX), UIAF (CO), UIF (SV), IVE (GT)
/// — the four jurisdictions Wavy supports today.
export async function GET(req: NextRequest) {
  const country = (req.nextUrl.searchParams.get("country") ?? "MX").toUpperCase();
  const period = req.nextUrl.searchParams.get("period") ?? defaultPeriod();

  if (!SUPPORTED_COUNTRIES.has(country)) {
    return NextResponse.json(
      { error: `País no soportado por Wavy Node: ${country}` },
      { status: 400 },
    );
  }
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json(
      { error: "Periodo inválido — usa YYYY-MM" },
      { status: 400 },
    );
  }

  if (!isWavyConfigured()) {
    return NextResponse.json(
      { status: "not_configured", country, period },
      { status: 503 },
    );
  }

  try {
    const reports = await listReports({ countryCode: country, period, limit: 25 });
    return NextResponse.json({
      status: "ok",
      country,
      period,
      reports: Array.isArray(reports) ? reports : [],
    });
  } catch (err) {
    if (err instanceof WavyNotConfiguredError) {
      return NextResponse.json(
        { status: "not_configured", country, period },
        { status: 503 },
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg.slice(0, 240) }, { status: 502 });
  }
}
