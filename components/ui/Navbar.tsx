"use client";
import { useMarketStore } from "@/store/useMarketStore";
import { Activity, Search } from "lucide-react";

export default function Navbar() {
  const { isLoading, lastUpdated, searchQuery, setSearchQuery } =
    useMarketStore();

  const lastSeen = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : "—";

  return (
    <nav className="h-14 border-b border-surface-border bg-surface-card flex items-center px-6 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <Activity size={18} className="text-brand-green" />
        <span className="font-display font-bold text-white tracking-tight text-base">
          CryptoView
        </span>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search coins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-surface-border rounded-lg pl-8 pr-3 py-1.5
                     text-xs text-white placeholder:text-brand-muted
                     outline-none focus:border-brand-blue transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Live status */}
        <div className="flex items-center gap-1.5 text-xs text-brand-muted">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-brand-gold animate-pulse" : "bg-brand-green animate-glow-pulse"}`}
          />
          {isLoading ? "Updating..." : `Updated ${lastSeen}`}
        </div>
      </div>
    </nav>
  );
}
