"use client";
import { useMarketStore } from "@/store/useMarketStore";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  Bitcoin,
  Layers,
} from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  loading?: boolean;
  accent?: string;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  positive,
  loading,
  accent = "#4d9fff",
}: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 animate-slide-up"
      style={{
        animationFillMode: "both",
        background: "#0f0f20",
        border: "1px solid #252540",
        borderBottom: `2px solid ${accent}`,
      }}
    >
      {/* Ambient glow in corner */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-brand-muted font-mono tracking-wider uppercase">
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 w-28 bg-surface-border rounded-md animate-pulse" />
          <div className="h-3 w-16 bg-surface-border/60 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-lg font-display font-bold text-white leading-tight">
            {value}
          </p>
          {sub && (
            <p
              className="text-xs mt-1 font-mono"
              style={{
                color:
                  positive === undefined
                    ? "#5a5a8a"
                    : positive
                      ? "#00d4aa"
                      : "#ff4d6d",
              }}
            >
              {positive !== undefined && (positive ? "▲ " : "▼ ")}
              {sub}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function StatsCards() {
  const { globalStats, coins, isLoading } = useMarketStore();
  const sorted = [...coins].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
  );
  const topGainer = sorted[0];
  const topLoser = sorted[sorted.length - 1];
  const loading = isLoading && !globalStats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCard
        icon={<DollarSign size={14} />}
        label="Market Cap"
        value={
          globalStats ? formatCurrency(globalStats.total_market_cap, true) : "—"
        }
        sub="Global crypto"
        accent="#4d9fff"
        loading={loading}
      />
      <StatCard
        icon={<BarChart2 size={14} />}
        label="24h Volume"
        value={
          globalStats ? formatCurrency(globalStats.total_volume, true) : "—"
        }
        sub="All exchanges"
        accent="#a78bfa"
        loading={loading}
      />
      <StatCard
        icon={<Bitcoin size={14} />}
        label="BTC Dominance"
        value={globalStats ? `${globalStats.btc_dominance.toFixed(1)}%` : "—"}
        accent="#f0c040"
        loading={loading}
      />
      <StatCard
        icon={<Layers size={14} />}
        label="Active Coins"
        value={globalStats ? globalStats.active_coins.toLocaleString() : "—"}
        accent="#00d4aa"
        loading={loading}
      />
      {topGainer && (
        <StatCard
          icon={<TrendingUp size={14} />}
          label="Top Gainer"
          value={topGainer.symbol.toUpperCase()}
          sub={formatPercent(topGainer.price_change_percentage_24h)}
          positive={true}
          accent="#00d4aa"
        />
      )}
      {topLoser && (
        <StatCard
          icon={<TrendingDown size={14} />}
          label="Top Loser"
          value={topLoser.symbol.toUpperCase()}
          sub={formatPercent(topLoser.price_change_percentage_24h)}
          positive={false}
          accent="#ff4d6d"
        />
      )}
    </div>
  );
}
