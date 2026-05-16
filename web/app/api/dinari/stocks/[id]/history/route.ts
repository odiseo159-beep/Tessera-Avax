import { NextRequest, NextResponse } from "next/server";
import { getHistoricalPrices, type DinariTimespan } from "@/lib/dinari-client";

interface Ctx {
  params: { id: string };
}

const ALLOWED: DinariTimespan[] = ["DAY", "WEEK", "MONTH", "YEAR"];

export async function GET(req: NextRequest, { params }: Ctx) {
  const raw = (req.nextUrl.searchParams.get("timespan") ?? "MONTH").toUpperCase();
  const timespan = (ALLOWED.includes(raw as DinariTimespan) ? raw : "MONTH") as DinariTimespan;
  try {
    const data = await getHistoricalPrices(params.id, timespan);
    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg.slice(0, 240) }, { status: 502 });
  }
}
