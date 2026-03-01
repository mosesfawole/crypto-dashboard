"use client";
import Image from "next/image";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { useMarketStore } from "@/store/useMarketStore";
import { formatCurrency, formatPercent, toBinanceSymbol } from "@/lib/utils";
import { X, Star, Sparkles } from "lucide-react";

export default function WatchlistPanel() {
  const { items, remove } = useWatchlistStore();
  const { coins, livePrices } = useMarketStore();

  const enriched = items.map((w) => {
    const coin = coins.find((c) => c.id === w.id);
    const live = livePrices[toBinanceSymbol(w.symbol)];
    return {
      ...w,
      price: live?.price ?? coin?.current_price ?? 0,
      change:
        live?.priceChangePercent ?? coin?.price_change_percentage_24h ?? 0,
    };
  });

  return (
    <div className="card flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border shrink-0">
        <div className="w-1 h-4 rounded-full bg-brand-gold" />
        <h2 className="text-xs font-display font-bold tracking-widest uppercase text-white">
          Watchlist
        </h2>
        {items.length > 0 && (
          <span className="ml-auto bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] px-2 py-0.5 rounded-full font-mono">
            {items.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {enriched.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center">
              <Star size={16} className="text-surface-border" />
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Star coins in the table to track them here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border/30">
            {enriched.map((item) => {
              const isUp = item.change >= 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors group"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={24}
                    height={24}
                    className="rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white font-display truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-brand-muted uppercase">
                      {item.symbol}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-white">
                      {item.price > 0 ? formatCurrency(item.price) : "—"}
                    </p>
                    <p
                      className="text-[10px] font-mono"
                      style={{ color: isUp ? "#00d4aa" : "#ff4d6d" }}
                    >
                      {item.change !== 0 ? formatPercent(item.change) : "—"}
                    </p>
                  </div>
                  <button
                    title="remove"
                    onClick={() => remove(item.id)}
                    className="text-brand-muted hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1"
                  >
                    <X size={12} />
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
