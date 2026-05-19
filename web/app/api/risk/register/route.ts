import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

import {
  registerAddress,
  isWavyConfigured,
  WavyNotConfiguredError,
} from "@/lib/wavy-client";

interface RegisterBody {
  address: string;
  description?: string;
  foreign_user_id?: string;
}

/// POST /api/risk/register
/// Body: { address, description?, foreign_user_id? }
///
/// Adds an address to Wavy Node's monitored set. After this, Wavy
/// continuously tracks the address and POSTs suspicious activity
/// alerts to our webhook (when configured). The KYC flow calls this
/// after a successful on-chain `addIdentity` so every verified wallet
/// is monitored from the moment it joins Tessera.
export async function POST(req: NextRequest) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.address || !isAddress(body.address)) {
    return NextResponse.json({ error: "Dirección inválida" }, { status: 400 });
  }

  if (!isWavyConfigured()) {
    return NextResponse.json({ status: "not_configured" }, { status: 503 });
  }

  try {
    const data = await registerAddress(
      body.address,
      body.foreign_user_id ?? body.address.toLowerCase(),
      body.description ?? "Tessera KYC-verified wallet",
    );
    return NextResponse.json({ status: "ok", id: data.id });
  } catch (err) {
    if (err instanceof WavyNotConfiguredError) {
      return NextResponse.json({ status: "not_configured" }, { status: 503 });
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg.slice(0, 240) }, { status: 502 });
  }
}
