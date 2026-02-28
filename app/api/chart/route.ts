import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const days = req.nextUrl.searchParams.get("days") ?? "7";

  if (!id) {
    return NextResponse.json({ error: "Missing coin id" }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
    }

    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    const res = await fetch(url, { headers, next: { revalidate: 300 } });

    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

    const json = await res.json();
    // json.prices is [[timestamp, price], ...]
    return NextResponse.json(json.prices);
  } catch (err) {
    console.error("[/api/chart]", err);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
