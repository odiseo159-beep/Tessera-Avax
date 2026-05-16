import { NextResponse } from "next/server";
import { listStocks } from "@/lib/dinari-client";

export async function GET() {
  try {
    const stocks = await listStocks();
    return NextResponse.json(stocks);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg.slice(0, 240) }, { status: 502 });
  }
}
