"use client";
import { useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useMarketStore } from "@/store/useMarketStore";
import { useWatchlistStore } from "@/store/useWatchListStore";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  toBinanceSymbol,
} from "@/lib/utils";
import Sparkline from "@/components/ui/Sparkline";
import { Star, ChevronUp, ChevronDown } from "lucide-react";
import type { Coin } from "@/types/market";

type SortKey =
  | "current_price"
  | "price_change_percentage_24h"
  | "market_cap"
  | "total_volume";

function SortIcon({
  col,
  sortBy,
  sortDir,
}: {
  col: SortKey;
  sortBy: SortKey;
  sortDir: "asc" | "desc";
}) {
  if (col !== sortBy) return <ChevronUp size={12} className="opacity-20" />;
  return sortDir === "asc" ? (
    <ChevronUp size={12} className="text-brand-blue" />
  ) : (
    <ChevronDown size={12} className="text-brand-blue" />
  );
}

// Flashes price cell when it updates
function LivePrice({ price, symbol }: { price: number; symbol: string }) {
  const prevRef = useRef(price);
  const cellRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (price === prevRef.current) return;
    const el = cellRef.current;
    if (!el) return;
    const cls = price > prevRef.current ? "flash-green" : "flash-red";
    el.classList.remove("flash-green", "flash-red");
    void el.offsetWidth; // reflow
    el.classList.add(cls);
    prevRef.current = price;
  }, [price]);

  return (
    <span ref={cellRef} className="font-mono tabular-nums">
      {formatCurrency(price)}
    </span>
  );
}

export default function MarketTable() {
  const {
    coins,
    livePrices,
    searchQuery,
    sortBy,
    sortDir,
    setSortBy,
    setSelectedCoin,
  } = useMarketStore();
  const { toggle, has } = useWatchlistStore();

  const displayed = useMemo(() => {
    let list: Coin[] = [...coins];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * mult;
    });

    return list;
  }, [coins, searchQuery, sortBy, sortDir]);

  const handleSort = (col: SortKey) => setSortBy(col);

  if (coins.length === 0) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-8 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-brand-muted">Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border">
        <h2 className="text-xs font-display font-bold tracking-widest uppercase text-brand-muted">
          Markets
        </h2>
        <span className="text-xs text-brand-muted">
          {displayed.length} coins
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs text-brand-muted">
              <th className="text-left px-5 py-3 font-normal w-8">#</th>
              <th className="text-left px-3 py-3 font-normal">Coin</th>
              <th
                className="text-right px-3 py-3 font-normal cursor-pointer hover:text-white select-none"
                onClick={() => handleSort("current_price")}
              >
                <div className="flex items-center justify-end gap-1">
                  Price{" "}
                  <SortIcon
                    col="current_price"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </div>
              </th>
              <th
                className="text-right px-3 py-3 font-normal cursor-pointer hover:text-white select-none"
                onClick={() => handleSort("price_change_percentage_24h")}
              >
                <div className="flex items-center justify-end gap-1">
                  24h %{" "}
                  <SortIcon
                    col="price_change_percentage_24h"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </div>
              </th>
              <th
                className="text-right px-3 py-3 font-normal cursor-pointer hover:text-white select-none hidden md:table-cell"
                onClick={() => handleSort("market_cap")}
              >
                <div className="flex items-center justify-end gap-1">
                  Mkt Cap{" "}
                  <SortIcon
                    col="market_cap"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </div>
              </th>
              <th
                className="text-right px-3 py-3 font-normal cursor-pointer hover:text-white select-none hidden lg:table-cell"
                onClick={() => handleSort("total_volume")}
              >
                <div className="flex items-center justify-end gap-1">
                  Volume{" "}
                  <SortIcon
                    col="total_volume"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </div>
              </th>
              <th className="text-right px-3 py-3 font-normal hidden xl:table-cell">
                7d Chart
              </th>
              <th className="px-5 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {displayed.map((coin) => {
              const binSym = toBinanceSymbol(coin.symbol);
              const live = livePrices[binSym];
              const price = live?.price ?? coin.current_price;
              const change =
                live?.priceChangePercent ?? coin.price_change_percentage_24h;
              const volume = live?.volume ?? coin.total_volume;
              const isUp = change >= 0;
              const isStarred = has(coin.id);

              return (
                <tr
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin)}
                  className="border-b border-surface-border/40 hover:bg-surface-hover transition-colors cursor-pointer group"
                >
                  {/* Rank */}
                  <td className="px-5 py-3 text-brand-muted text-xs">
                    {coin.market_cap_rank}
                  </td>

                  {/* Coin identity */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={28}
                        height={28}
                        className="rounded-full shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold font-display leading-tight truncate">
                          {coin.name}
                        </p>
                        <p className="text-brand-muted text-xs uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Live price with flash */}
                  <td className="px-3 py-3 text-right text-white">
                    <LivePrice price={price} symbol={binSym} />
                  </td>

                  {/* 24h change */}
                  <td
                    className={`px-3 py-3 text-right font-mono text-xs ${isUp ? "text-brand-green" : "text-brand-red"}`}
                  >
                    {formatPercent(change)}
                  </td>

                  {/* Market cap */}
                  <td className="px-3 py-3 text-right text-brand-muted text-xs hidden md:table-cell">
                    {formatCurrency(coin.market_cap, true)}
                  </td>

                  {/* Volume */}
                  <td className="px-3 py-3 text-right text-brand-muted text-xs hidden lg:table-cell">
                    {formatCurrency(volume, true)}
                  </td>

                  {/* Sparkline */}
                  <td className="px-3 py-3 hidden xl:table-cell">
                    <div className="flex justify-end">
                      <Sparkline
                        data={coin.sparkline_in_7d?.price ?? []}
                        positive={isUp}
                        width={80}
                        height={28}
                      />
                    </div>
                  </td>

                  {/* Watchlist star */}
                  <td className="px-5 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle({
                          id: coin.id,
                          symbol: coin.symbol,
                          name: coin.name,
                          image: coin.image,
                        });
                      }}
                      className={`transition-colors ${isStarred ? "text-brand-gold" : "text-brand-muted hover:text-brand-gold"}`}
                      title={
                        isStarred ? "Remove from watchlist" : "Add to watchlist"
                      }
                    >
                      <Star
                        size={14}
                        fill={isStarred ? "currentColor" : "none"}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
