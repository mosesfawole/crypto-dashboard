import { Suspense } from "react";
import DataBootstrapper from "@/components/dashboard/DataBootstrapper";
import Navbar from "@/components/ui/Navbar";
import TickerBar from "@/components/dashboard/TickerBar";
import StatsCards from "@/components/dashboard/StatsCards";
import MarketTable from "@/components/dashboard/MarketTable";
import WatchlistPanel from "@/components/dashboard/WatchlistPanel";
import CoinDetailModal from "@/components/dashboard/CoinDetailModal";
import GlobeScene from "@/components/globe/GlobeScene";

export default function DashboardPage() {
  return (
    <DataBootstrapper>
      {/* Full-height app shell */}
      <div className="flex flex-col h-screen overflow-hidden bg-surface bg-grid">
        {/* ── Sticky top bars ───────────────────────── */}
        <Navbar />
        <TickerBar />

        {/* ── Main content area ─────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Scrollable main */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-5 space-y-4 max-w-screen-2xl mx-auto">
              {/* Stats row */}
              <StatsCards />

              {/* Table + Watchlist */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <MarketTable />
                </div>
                {/* Watchlist — stacks below table on mobile/tablet, side on xl */}
                <div className="xl:col-span-1">
                  <WatchlistPanel />
                </div>
              </div>

              {/* Bottom breathing room */}
              <div className="h-6" />
            </div>
          </main>

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-5 space-y-4 max-w-screen-2xl mx-auto">
              <StatsCards />

              {/* Globe full width */}
              <Suspense
                fallback={
                  <div className="h-64 card flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                <GlobeScene />
              </Suspense>
            </div>
          </main>
        </div>
      </div>

      {/* Coin modal — portals on top of everything */}
      <CoinDetailModal />
    </DataBootstrapper>
  );
}
