"use client";
import { useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useMarketStore } from "@/store/useMarketStore";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { formatCurrency, formatPercent, toBinanceSymbol } from "@/lib/utils";
import Sparkline from "@/components/ui/Sparkline";
import { Star, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
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
  if (col !== sortBy)
    return <ChevronsUpDown size={10} className="opacity-20" />;
  return sortDir === "asc" ? (
    <ChevronUp size={10} className="text-brand-blue" />
  ) : (
    <ChevronDown size={10} className="text-brand-blue" />
  );
}

function LivePrice({ price }: { price: number }) {
  const prevRef = useRef(price);
  const cellRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (price === prevRef.current) return;
    const el = cellRef.current;
    if (!el) return;
    const cls = price > prevRef.current ? "flash-green" : "flash-red";
    el.classList.remove("flash-green", "flash-red");
    void el.offsetWidth;
    el.classList.add(cls);
    prevRef.current = price;
  }, [price]);

  return (
    <span ref={cellRef} className="font-mono tabular-nums text-white text-xs">
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
    list.sort((a, b) => (sortDir === "asc" ? 1 : -1) * (a[sortBy] - b[sortBy]));
    return list;
  }, [coins, searchQuery, sortBy, sortDir]);

  if (coins.length === 0) {
    return (
      <div className="card p-12 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-brand-muted">Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-brand-blue" />
          <h2 className="text-xs font-display font-bold tracking-widest uppercase text-white">
            Markets
          </h2>
        </div>
        <span className="text-xs text-brand-muted">
          {displayed.length} coins
        </span>
      </div>

      {/* Table wrapper — horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr className="border-b border-surface-border/60 text-brand-muted">
              <th className="text-left px-4 py-3 font-normal w-8">#</th>
              <th className="text-left px-3 py-3 font-normal">Coin</th>
              <th
                className="text-right px-3 py-3 font-normal cursor-pointer hover:text-white select-none"
                onClick={() => setSortBy("current_price")}
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
                onClick={() => setSortBy("price_change_percentage_24h")}
              >
                <div className="flex items-center justify-end gap-1">
                  24h{" "}
                  <SortIcon
                    col="price_change_percentage_24h"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </div>
              </th>
              <th
                className="text-right px-3 py-3 font-normal cursor-pointer hover:text-white select-none hidden sm:table-cell"
                onClick={() => setSortBy("market_cap")}
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
              <th className="text-right px-3 py-3 font-normal hidden lg:table-cell">
                7d
              </th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {displayed.map((coin) => {
              const binSym = toBinanceSymbol(coin.symbol);
              const live = livePrices[binSym];
              const price = live?.price ?? coin.current_price;
              const change =
                live?.priceChangePercent ?? coin.price_change_percentage_24h;
              const isUp = change >= 0;
              const isStarred = has(coin.id);

              return (
                <tr
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin)}
                  className="border-b border-surface-border/30 hover:bg-surface-hover transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 text-brand-muted">
                    {coin.market_cap_rank}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={24}
                        height={24}
                        className="rounded-full shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-white font-semibold font-display text-xs leading-tight truncate max-w-[80px] sm:max-w-none">
                          {coin.name}
                        </p>
                        <p className="text-brand-muted text-[10px] uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-right">
                    <LivePrice price={price} />
                  </td>

                  <td className="px-3 py-3 text-right">
                    <span
                      className="font-mono tabular-nums text-xs px-1.5 py-0.5 rounded"
                      style={{
                        color: isUp ? "#00d4aa" : "#ff4d6d",
                        background: isUp
                          ? "rgba(0,212,170,0.08)"
                          : "rgba(255,77,109,0.08)",
                      }}
                    >
                      {formatPercent(change)}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-right text-brand-muted hidden sm:table-cell">
                    {formatCurrency(coin.market_cap, true)}
                  </td>

                  <td className="px-3 py-3 hidden lg:table-cell">
                    <div className="flex justify-end">
                      <Sparkline
                        data={coin.sparkline_in_7d?.price ?? []}
                        positive={isUp}
                        width={72}
                        height={26}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      title="click"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle({
                          id: coin.id,
                          symbol: coin.symbol,
                          name: coin.name,
                          image: coin.image,
                        });
                      }}
                      className={`transition-all duration-200 ${isStarred ? "text-brand-gold" : "text-brand-muted opacity-0 group-hover:opacity-100 hover:text-brand-gold"}`}
                    >
                      <Star
                        size={13}
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
