import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";

import { abis } from "@/lib/contracts";

const ALLOWED_COUNTRIES = new Set(["MX", "CO", "AR", "BR", "CL", "PE", "UY"]);

interface VerifyBody {
  wallet: string;
  country: string;
}

export async function POST(req: NextRequest) {
  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { wallet, country } = body;

  if (!wallet || !isAddress(wallet)) {
    return NextResponse.json(
      { error: "Dirección de wallet inválida" },
      { status: 400 }
    );
  }
  if (!country || !ALLOWED_COUNTRIES.has(country)) {
    return NextResponse.json({ error: "País no soportado" }, { status: 400 });
  }

  const issuerKey = process.env.KYC_ISSUER_PRIVATE_KEY;
  const registryAddress = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY;
  const rpc =
    process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc";

  if (!issuerKey || !registryAddress) {
    return NextResponse.json(
      {
        error:
          "El servidor no está configurado. Falta KYC_ISSUER_PRIVATE_KEY o NEXT_PUBLIC_IDENTITY_REGISTRY.",
      },
      { status: 500 }
    );
  }

  try {
    const account = privateKeyToAccount(issuerKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http(rpc),
    });
    const publicClient = createPublicClient({
      chain: avalancheFuji,
      transport: http(rpc),
    });

    const already = await publicClient.readContract({
      abi: abis.identityRegistry,
      address: registryAddress as `0x${string}`,
      functionName: "isVerified",
      args: [wallet as `0x${string}`],
    });

    let txHash: `0x${string}` | null = null;
    if (!already) {
      txHash = await walletClient.writeContract({
        abi: abis.identityRegistry,
        address: registryAddress as `0x${string}`,
        functionName: "addIdentity",
        args: [wallet as `0x${string}`, country],
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
    }

    // Register the wallet with Wavy Node for ongoing risk monitoring.
    // Runs in BOTH branches (first-time KYC and re-verify of an
    // already-attested wallet) because Wavy's register endpoint is
    // idempotent — second calls update foreign_user_id/description
    // instead of duplicating. Without this, wallets KYC'd before the
    // Wavy key landed would never enter the monitoring set.
    //
    // Awaited inline so the serverless runtime can't kill it; the
    // try/catch keeps KYC's response guaranteed-success even when
    // Wavy is down or unconfigured.
    try {
      const { registerAddress, isWavyConfigured } = await import("@/lib/wavy-client");
      if (isWavyConfigured()) {
        await registerAddress(
          wallet,
          wallet.toLowerCase(),
          `Tessera KYC · ${country}`,
        );
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      console.error("Wavy registerAddress failed (non-blocking):", m);
    }

    return NextResponse.json({ alreadyVerified: already, txHash });
  } catch (error) {
    const message =
      error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.error("KYC verify failed:", message);
    return NextResponse.json(
      { error: message.slice(0, 240) },
      { status: 500 }
    );
  }
}
