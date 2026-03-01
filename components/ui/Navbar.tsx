"use client";
import { useState } from "react";
import { useMarketStore } from "@/store/useMarketStore";
import { Activity, Search, X, Menu } from "lucide-react";

export default function Navbar() {
  const { isLoading, lastUpdated, searchQuery, setSearchQuery } =
    useMarketStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const lastSeen = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <nav className="h-14 border-b border-surface-border bg-surface-card/80 backdrop-blur-md flex items-center px-4 md:px-6 gap-3 shrink-0 sticky top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
          <Activity size={14} className="text-brand-green" />
        </div>
        <span className="font-display font-bold text-white tracking-tight text-sm">
          Crypto<span className="text-brand-green">View</span>
        </span>
      </div>

      {/* Desktop search */}
      <div className="relative hidden md:flex flex-1 max-w-xs ml-4">
        <Search
          size={12}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search coins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-surface-border rounded-lg pl-8 pr-3 py-1.5
                     text-xs text-white placeholder:text-brand-muted
                     outline-none focus:border-brand-blue/60 transition-colors"
        />
        {searchQuery && (
          <button
            title="click"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-surface border border-surface-border rounded-full px-3 py-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-brand-gold" : "bg-brand-green animate-glow-pulse"}`}
          />
          <span className="text-xs text-brand-muted">
            {isLoading ? "Syncing" : lastSeen ? `${lastSeen}` : "Live"}
          </span>
        </div>

        {/* Mobile search toggle */}
        <button
          title="toggle"
          className="md:hidden text-brand-muted hover:text-white p-1.5 rounded-lg border border-surface-border bg-surface"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search size={14} />
        </button>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 p-3 bg-surface-card border-b border-surface-border md:hidden z-40">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
            />
            <input
              autoFocus
              type="text"
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg pl-8 pr-3 py-2
                         text-xs text-white placeholder:text-brand-muted outline-none focus:border-brand-blue/60"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
