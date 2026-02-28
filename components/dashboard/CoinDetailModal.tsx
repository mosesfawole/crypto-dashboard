"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useMarketStore } from "@/store/useMarketStore";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { formatCurrency, formatPercent, toBinanceSymbol } from "@/lib/utils";
import { X, Star, TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Candle } from "@/types/market";

const RANGES = ["1D", "7D", "30D", "90D"] as const;
type Range = (typeof RANGES)[number];

const RANGE_DAYS: Record<Range, number> = {
  "1D": 1,
  "7D": 7,
  "30D": 30,
  "90D": 90,
};

export default function CoinDetailModal() {
  const { selectedCoin, setSelectedCoin, livePrices } = useMarketStore();
  const { toggle, has } = useWatchlistStore();
  const [range, setRange] = useState<Range>("7D");
  const [chartData, setChartData] = useState<{ time: string; price: number }[]>(
    [],
  );
  const [loadingChart, setLoadingChart] = useState(false);

  const fetchChart = useCallback(async (coinId: string, days: number) => {
    setLoadingChart(true);
    try {
      const res = await fetch(`/api/chart?id=${coinId}&days=${days}`);
      if (!res.ok) throw new Error("chart fetch failed");
      const data: [number, number][] = await res.json();
      setChartData(
        data.map(([ts, price]) => ({
          time: new Date(ts).toLocaleDateString(),
          price: +price.toFixed(4),
        })),
      );
    } catch {
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCoin) return;
    fetchChart(selectedCoin.id, RANGE_DAYS[range]);
  }, [selectedCoin, range, fetchChart]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCoin(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSelectedCoin]);

  if (!selectedCoin) return null;

  const coin = selectedCoin;
  const binSym = toBinanceSymbol(coin.symbol);
  const live = livePrices[binSym];
  const price = live?.price ?? coin.current_price;
  const change = live?.priceChangePercent ?? coin.price_change_percentage_24h;
  const isUp = change >= 0;
  const isStarred = has(coin.id);

  const minPrice = chartData.length
    ? Math.min(...chartData.map((d) => d.price))
    : 0;
  const maxPrice = chartData.length
    ? Math.max(...chartData.map((d) => d.price))
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setSelectedCoin(null)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-surface-border">
          <Image
            src={coin.image}
            alt={coin.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-1">
            <h2 className="font-display font-bold text-white text-lg leading-tight">
              {coin.name}
            </h2>
            <p className="text-brand-muted text-xs uppercase">
              {coin.symbol} · Rank #{coin.market_cap_rank}
            </p>
          </div>
          <button
            title="Toggle"
            onClick={() =>
              toggle({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                image: coin.image,
              })
            }
            className={`p-2 rounded-lg border border-surface-border transition-colors ${isStarred ? "text-brand-gold" : "text-brand-muted hover:text-brand-gold"}`}
          >
            <Star size={16} fill={isStarred ? "currentColor" : "none"} />
          </button>
          <button
            title="Selected Coin"
            onClick={() => setSelectedCoin(null)}
            className="p-2 rounded-lg border border-surface-border text-brand-muted hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Price hero */}
        <div className="px-6 py-4 flex items-end gap-4">
          <span className="text-3xl font-display font-bold text-white">
            {formatCurrency(price)}
          </span>
          <div
            className={`flex items-center gap-1 text-sm mb-1 ${isUp ? "text-brand-green" : "text-brand-red"}`}
          >
            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {formatPercent(change)}
            <span className="text-brand-muted text-xs ml-1">24h</span>
          </div>
        </div>

        {/* Range selector */}
        <div className="px-6 flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                range === r
                  ? "border-brand-blue text-brand-blue bg-brand-blue-dim"
                  : "border-surface-border text-brand-muted hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="px-6 py-4 h-56">
          {loadingChart ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isUp ? "#00d4aa" : "#ff4d6d"}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={isUp ? "#00d4aa" : "#ff4d6d"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#6666aa", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[minPrice * 0.995, maxPrice * 1.005]}
                  tick={{ fill: "#6666aa", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCurrency(v, true)}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0e0e1a",
                    border: "1px solid #1c1c32",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#6666aa" }}
                  itemStyle={{ color: isUp ? "#00d4aa" : "#ff4d6d" }}
                  formatter={(v: number) => [formatCurrency(v), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? "#00d4aa" : "#ff4d6d"}
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-surface-border m-6 mt-2 rounded-xl overflow-hidden text-xs">
          {[
            { label: "24h High", value: formatCurrency(coin.high_24h) },
            { label: "24h Low", value: formatCurrency(coin.low_24h) },
            {
              label: "Market Cap",
              value: formatCurrency(coin.market_cap, true),
            },
            { label: "Volume", value: formatCurrency(coin.total_volume, true) },
            { label: "ATH", value: formatCurrency(coin.ath) },
            {
              label: "ATH Change",
              value: formatPercent(coin.ath_change_percentage),
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-card px-4 py-3">
              <p className="text-brand-muted mb-1">{label}</p>
              <p className="text-white font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
