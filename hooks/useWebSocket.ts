"use client";
import { useEffect, useRef } from "react";
import { useMarketStore } from "@/store/useMarketStore";
import type { BinanceTick, PriceTick } from "@/types/market";

// Binance free public WebSocket — no API key needed
const WS_BASE = "wss://stream.binance.com:9443/stream?streams=";

const SYMBOLS = [
  "btcusdt",
  "ethusdt",
  "bnbusdt",
  "solusdt",
  "xrpusdt",
  "adausdt",
  "dogeusdt",
  "avaxusdt",
  "dotusdt",
  "maticusdt",
  "linkusdt",
  "uniusdt",
  "atomusdt",
  "ltcusdt",
  "nearusdt",
];

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const updateLivePrice = useMarketStore((s) => s.updateLivePrice);

  useEffect(() => {
    const connect = () => {
      const streams = SYMBOLS.map((s) => `${s}@ticker`).join("/");
      const ws = new WebSocket(`${WS_BASE}${streams}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] connected to Binance stream");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const d: BinanceTick = msg.data;
          if (!d || d.e !== "24hrTicker") return;

          const tick: PriceTick = {
            symbol: d.s,
            price: parseFloat(d.c),
            priceChangePercent: parseFloat(d.P),
            volume: parseFloat(d.v),
            high: parseFloat(d.h),
            low: parseFloat(d.l),
            eventTime: d.E,
          };
          updateLivePrice(tick);
        } catch {
          // malformed message, ignore
        }
      };

      ws.onerror = () => {
        console.warn("[WS] error, will reconnect in 5s");
      };

      ws.onclose = () => {
        console.log("[WS] closed, reconnecting in 5s...");
        reconnectRef.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [updateLivePrice]);
}
