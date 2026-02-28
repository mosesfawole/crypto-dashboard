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
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <Navbar />

        {/* Live ticker strip */}
        <TickerBar />

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Stats cards */}
            <StatsCards />

            {/* Table + watchlist */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <MarketTable />
              </div>
              <div>
                <WatchlistPanel />
              </div>
            </div>

            {/* Bottom padding */}
            <div className="h-4" />
          </main>

          {/* Three.js Globe sidebar (hidden on small screens) */}
          <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-l border-surface-border bg-surface-card shrink-0">
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <GlobeScene />
            </Suspense>
          </aside>
        </div>
      </div>

      {/* Coin detail modal — renders on top of everything */}
      <CoinDetailModal />
    </DataBootstrapper>
  );
}
