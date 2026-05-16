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

    if (already) {
      return NextResponse.json({ alreadyVerified: true, txHash: null });
    }

    const txHash = await walletClient.writeContract({
      abi: abis.identityRegistry,
      address: registryAddress as `0x${string}`,
      functionName: "addIdentity",
      args: [wallet as `0x${string}`, country],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return NextResponse.json({ alreadyVerified: false, txHash });
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
