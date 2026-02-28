"use client";
import Image from "next/image";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { useMarketStore } from "@/store/useMarketStore";
import { formatCurrency, formatPercent, toBinanceSymbol } from "@/lib/utils";
import { X, Star } from "lucide-react";

export default function WatchlistPanel() {
  const { items, remove } = useWatchlistStore();
  const { coins, livePrices } = useMarketStore();

  // Enrich watchlist items with full coin data
  const enriched = items.map((w) => {
    const coin = coins.find((c) => c.id === w.id);
    const binSym = toBinanceSymbol(w.symbol);
    const live = livePrices[binSym];

    return {
      ...w,
      price: live?.price ?? coin?.current_price ?? 0,
      change:
        live?.priceChangePercent ?? coin?.price_change_percentage_24h ?? 0,
    };
  });

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-surface-border shrink-0">
        <Star size={14} className="text-brand-gold" fill="currentColor" />
        <h2 className="text-xs font-display font-bold tracking-widest uppercase text-brand-muted">
          Watchlist
        </h2>
        <span className="ml-auto text-xs text-brand-muted">{items.length}</span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {enriched.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-6">
            <Star size={22} className="text-surface-border" />
            <p className="text-xs text-brand-muted">
              Star coins in the market table to track them here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border/40">
            {enriched.map((item) => {
              const isUp = item.change >= 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-hover transition-colors group"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={26}
                    height={26}
                    className="rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate font-display">
                      {item.name}
                    </p>
                    <p className="text-xs text-brand-muted uppercase">
                      {item.symbol}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-white">
                      {item.price > 0 ? formatCurrency(item.price) : "—"}
                    </p>
                    <p
                      className={`text-xs font-mono ${isUp ? "text-brand-green" : "text-brand-red"}`}
                    >
                      {item.change !== 0 ? formatPercent(item.change) : "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-brand-muted hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
