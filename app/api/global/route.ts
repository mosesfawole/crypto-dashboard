import { NextResponse } from "next/server";
import type { GlobalStats } from "@/types/market";

export async function GET() {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
    }

    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

    const json = await res.json();
    const d = json.data;

    const stats: GlobalStats = {
      total_market_cap: d.total_market_cap.usd,
      total_volume: d.total_volume.usd,
      btc_dominance: d.market_cap_percentage.btc,
      active_coins: d.active_cryptocurrencies,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[/api/global]", err);
    return NextResponse.json({ error: "Failed to fetch global stats" }, { status: 500 });
  }
}
