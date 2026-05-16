import { NextResponse } from "next/server";
import { getStockPrice } from "@/lib/dinari-client";

interface Ctx {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const data = await getStockPrice(params.id);
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg.slice(0, 240) }, { status: 502 });
  }
}
