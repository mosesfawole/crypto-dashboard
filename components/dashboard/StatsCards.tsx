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
}

function StatCard({
  icon,
  label,
  value,
  sub,
  positive,
  loading,
}: StatCardProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex gap-4 items-start animate-slide-up">
      <div className="p-2 rounded-lg bg-surface border border-surface-border text-brand-muted">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-brand-muted mb-1">{label}</p>
        {loading ? (
          <div className="h-5 w-24 bg-surface-border rounded animate-pulse" />
        ) : (
          <p className="text-base font-display font-bold text-white truncate">
            {value}
          </p>
        )}
        {sub && !loading && (
          <p
            className={`text-xs mt-0.5 ${positive === undefined ? "text-brand-muted" : positive ? "text-brand-green" : "text-brand-red"}`}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function StatsCards() {
  const { globalStats, coins, isLoading } = useMarketStore();

  // Compute top gainer / loser from coin list
  const sorted = [...coins].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
  );
  const topGainer = sorted[0];
  const topLoser = sorted[sorted.length - 1];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={<DollarSign size={16} />}
        label="Total Market Cap"
        value={
          globalStats ? formatCurrency(globalStats.total_market_cap, true) : "—"
        }
        sub="Global crypto market"
        loading={isLoading && !globalStats}
      />
      <StatCard
        icon={<BarChart2 size={16} />}
        label="24h Volume"
        value={
          globalStats ? formatCurrency(globalStats.total_volume, true) : "—"
        }
        sub="Across all exchanges"
        loading={isLoading && !globalStats}
      />
      <StatCard
        icon={<Bitcoin size={16} />}
        label="BTC Dominance"
        value={globalStats ? `${globalStats.btc_dominance.toFixed(1)}%` : "—"}
        loading={isLoading && !globalStats}
      />
      <StatCard
        icon={<Layers size={16} />}
        label="Active Coins"
        value={globalStats ? globalStats.active_coins.toLocaleString() : "—"}
        loading={isLoading && !globalStats}
      />
      {topGainer && (
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Top Gainer (24h)"
          value={topGainer.name}
          sub={formatPercent(topGainer.price_change_percentage_24h)}
          positive={true}
        />
      )}
      {topLoser && (
        <StatCard
          icon={<TrendingDown size={16} />}
          label="Top Loser (24h)"
          value={topLoser.name}
          sub={formatPercent(topLoser.price_change_percentage_24h)}
          positive={false}
        />
      )}
    </div>
  );
}
