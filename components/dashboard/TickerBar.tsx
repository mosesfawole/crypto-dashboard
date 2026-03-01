"use client";
import { useMarketStore } from "@/store/useMarketStore";
import { formatCurrency, formatPercent, toBinanceSymbol } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function TickerBar() {
  const { coins, livePrices } = useMarketStore();
  const tickerCoins = coins.slice(0, 20);
  const doubled = [...tickerCoins, ...tickerCoins];

  if (tickerCoins.length === 0) {
    return (
      <div
        className="h-10 flex items-center px-6 shrink-0"
        style={{ background: "#0a0a18", borderBottom: "1px solid #252540" }}
      >
        <span className="text-xs text-brand-muted animate-pulse tracking-widest">
          LOADING MARKET DATA...
        </span>
      </div>
    );
  }

  return (
    <div
      className="h-10 overflow-hidden relative shrink-0 flex items-center"
      style={{ background: "#0a0a18", borderBottom: "1px solid #252540" }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #0a0a18, transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #0a0a18, transparent)" }}
      />

      <div className="ticker-track items-center flex">
        {doubled.map((coin, i) => {
          const live = livePrices[toBinanceSymbol(coin.symbol)];
          const price = live?.price ?? coin.current_price;
          const change =
            live?.priceChangePercent ?? coin.price_change_percentage_24h;
          const isUp = change >= 0;

          return (
            <div
              key={`${coin.id}-${i}`}
              className="flex items-center gap-4 shrink-0 px-6"
              style={{ borderRight: "1px solid #252540" }}
            >
              <span
                className="text-[14px] font-mono font-bold tracking-widest uppercase px-2"
                style={{ color: "#8888cc" }}
              >
                {coin.symbol}
              </span>

              <span className="text-[14px] font-mono text-white tabular-nums">
                {formatCurrency(price)}
              </span>

              <span
                className="text-[10px] font-mono tabular-nums flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                style={{
                  color: isUp ? "#00d4aa" : "#ff4d6d",
                  background: isUp
                    ? "rgba(0,212,170,0.08)"
                    : "rgba(255,77,109,0.08)",
                }}
              >
                {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {formatPercent(change)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
