import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistEntry } from "@/types/market";

interface WatchlistState {
  items: WatchlistEntry[];
  add: (coin: WatchlistEntry) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  toggle: (coin: WatchlistEntry) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (coin) => set((s) => ({ items: [...s.items, coin] })),

      remove: (id) =>
        set((s) => ({ items: s.items.filter((c) => c.id !== id) })),

      has: (id) => get().items.some((c) => c.id === id),

      toggle: (coin) =>
        get().has(coin.id) ? get().remove(coin.id) : get().add(coin),
    }),
    { name: "crypto-watchlist" },
  ),
);
