"use client";
import { useEffect } from "react";
import { useMarketStore } from "@/store/useMarketStore";

export function usePrices() {
  const { setCoins, setGlobalStats, setLoading, setError } = useMarketStore();

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch coins and global stats in parallel
        const [coinsRes, globalRes] = await Promise.all([
          fetch("/api/coins"),
          fetch("/api/global"),
        ]);

        if (!coinsRes.ok) throw new Error("Failed to fetch coins");
        const coins = await coinsRes.json();
        if (!cancelled) setCoins(coins);

        if (globalRes.ok) {
          const global = await globalRes.json();
          if (!cancelled) setGlobalStats(global);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setCoins, setGlobalStats, setLoading, setError]);
}
