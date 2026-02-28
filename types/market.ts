export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d?: {
    price: number[];
  };
}
export interface BinanceTick {
  e: "24hrTicker";
  s: string; // symbol e.g. "BTCUSDT"
  c: string; // close / current price
  P: string; // price change percent
  v: string; // volume
  h: string; // high
  l: string; // low
  E: number; // event time
}

export interface PriceTick {
  symbol: string;
  price: number;
  priceChangePercent: number;
  volume: number;
  high: number;
  low: number;
  eventTime: number;
}

// ─── Candlestick ──────────────────────────────────────────────────────────────
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Globe marker ─────────────────────────────────────────────────────────────
export interface ExchangeMarker {
  label: string;
  lat: number;
  lng: number;
  volume: number; // 0–100 scale for dot size
  color: string;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────
export type WatchlistEntry = Pick<Coin, "id" | "symbol" | "name" | "image">;

// ─── Global stats ─────────────────────────────────────────────────────────────
export interface GlobalStats {
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  active_coins: number;
}
