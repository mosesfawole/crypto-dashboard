"use client";
import { useEffect } from "react";
import { usePrices } from "@/hooks/usePrices";
import { useWebSocket } from "@/hooks/useWebSocket";

/**
 * Mounts inside the server-rendered dashboard layout.
 * This thin client wrapper kicks off both data strategies:
 *   1. usePrices  → REST poll every 30s (initial data + refresh)
 *   2. useWebSocket → Binance live ticks for prices
 */
export default function DataBootstrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  usePrices();
  useWebSocket();

  return <>{children}</>;
}
