import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

import {
  scanRisk,
  isWavyConfigured,
  WavyNotConfiguredError,
} from "@/lib/wavy-client";

/// GET /api/risk/scan?address=0x...&chainId=43114
///
/// Returns the cached risk result for an address. Honest about the
/// "not_configured" state — when WAVY_API_KEY is missing we surface
/// that to the client so the UI can render an "awaiting key" pill
/// instead of fabricating a score. The pitch is compliance-first;
/// mocked risk numbers would undermine the entire story.
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const chainId = req.nextUrl.searchParams.get("chainId") ?? undefined;

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Dirección inválida" }, { status: 400 });
  }

  if (!isWavyConfigured()) {
    return NextResponse.json({ status: "not_configured" }, { status: 503 });
  }

  try {
    const result = await scanRisk(address, chainId);
    if (!result) {
      return NextResponse.json({ status: "no_data" }, { status: 200 });
    }
    return NextResponse.json({
      status: "ok",
      score: result.riskScore,
      level: result.riskLevel,
      reason: result.riskReason,
      suspicious: result.suspiciousActivity,
      patterns: result.patternsDetected.length,
      transactions: result.transactionsAnalyzed,
      analyzedAt: result.completedAt,
    });
  } catch (err) {
    if (err instanceof WavyNotConfiguredError) {
      return NextResponse.json({ status: "not_configured" }, { status: 503 });
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg.slice(0, 240) }, { status: 502 });
  }
}
