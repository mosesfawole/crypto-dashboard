"use client";
import { useMarketStore } from "@/store/useMarketStore";
import { formatCurrency, formatPercent, toBinanceSymbol } from "@/lib/utils";

export default function TickerBar() {
  const { coins, livePrices } = useMarketStore();

  // Take top 20 by market cap
  const tickerCoins = coins.slice(0, 20);
  // Duplicate for seamless loop
  const doubled = [...tickerCoins, ...tickerCoins];

  if (tickerCoins.length === 0) {
    return (
      <div className="h-9 border-b border-surface-border bg-surface-card flex items-center px-4">
        <span className="text-xs text-brand-muted animate-pulse">
          Loading market data...
        </span>
      </div>
    );
  }

  return (
    <div className="h-9 border-b border-surface-border bg-surface-card overflow-hidden relative shrink-0">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-surface-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-surface-card to-transparent z-10 pointer-events-none" />

      <div className="ticker-track h-full items-center flex">
        {doubled.map((coin, i) => {
          const binSym = toBinanceSymbol(coin.symbol);
          const live = livePrices[binSym];
          const price = live?.price ?? coin.current_price;
          const change =
            live?.priceChangePercent ?? coin.price_change_percentage_24h;
          const isUp = change >= 0;

          return (
            <div
              key={`${coin.id}-${i}`}
              className="flex items-center gap-2 px-5 shrink-0 h-full border-r border-surface-border/40"
            >
              <span className="text-xs text-white/70 font-display font-semibold uppercase tracking-wider">
                {coin.symbol}
              </span>
              <span className="text-xs font-mono text-white">
                {formatCurrency(price)}
              </span>
              <span
                className={`text-xs font-mono ${isUp ? "text-brand-green" : "text-brand-red"}`}
              >
                {formatPercent(change)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
