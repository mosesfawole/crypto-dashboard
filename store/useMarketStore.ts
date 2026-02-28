import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Coin, PriceTick, GlobalStats } from "@/types/market";

type SortableKey =
  | "current_price"
  | "price_change_percentage_24h"
  | "market_cap"
  | "total_volume";

interface MarketState {
  // ── Data ─────────────────────────────────────────────────────────────────
  coins: Coin[];
  livePrices: Record<string, PriceTick>; // keyed by Binance symbol e.g. "BTCUSDT"
  globalStats: GlobalStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  selectedCoin: Coin | null;

  // ── Filters ───────────────────────────────────────────────────────────────
  searchQuery: string;
  sortBy: SortableKey;
  sortDir: "asc" | "desc";

  // ── Actions ───────────────────────────────────────────────────────────────
  setCoins: (coins: Coin[]) => void;
  setGlobalStats: (stats: GlobalStats) => void;
  updateLivePrice: (tick: PriceTick) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (col: SortableKey, dir?: "asc" | "desc") => void;
  setSelectedCoin: (coin: Coin | null) => void;
}

export const useMarketStore = create<MarketState>()(
  devtools(
    (set, get) => ({
      coins: [],
      livePrices: {},
      globalStats: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
      selectedCoin: null,
      searchQuery: "",
      sortBy: "market_cap",
      sortDir: "desc",

      setCoins: (coins) =>
        set({ coins, lastUpdated: Date.now(), error: null }, false, "setCoins"),

      setGlobalStats: (globalStats) =>
        set({ globalStats }, false, "setGlobalStats"),

      updateLivePrice: (tick) =>
        set(
          (s) => ({
            livePrices: { ...s.livePrices, [tick.symbol]: tick },
          }),
          false,
          "updateLivePrice",
        ),

      setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

      setError: (error) => set({ error }, false, "setError"),

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }, false, "setSearchQuery"),

      setSortBy: (sortBy, dir) =>
        set(
          (s) => ({
            sortBy,
            sortDir:
              dir ??
              (s.sortBy === sortBy
                ? s.sortDir === "asc"
                  ? "desc"
                  : "asc"
                : "desc"),
          }),
          false,
          "setSortBy",
        ),

      setSelectedCoin: (selectedCoin) =>
        set({ selectedCoin }, false, "setSelectedCoin"),
    }),
    { name: "MarketStore" },
  ),
);
