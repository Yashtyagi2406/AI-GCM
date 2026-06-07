import { Suspense } from 'react'

// Overview dashboard — executive KPI summary
export default function OverviewPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <DateRangePicker />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Suspense fallback={<KpiSkeleton />}>
          <KpiCards />
        </Suspense>
      </div>

      {/* Cost Trend + Provider Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <CostTrendChart />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<ChartSkeleton />}>
            <ProviderBreakdown />
          </Suspense>
        </div>
      </div>

      {/* Team Leaderboard + Alert Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Suspense fallback={<TableSkeleton />}>
            <TeamLeaderboard />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<TableSkeleton />}>
            <AlertFeed />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

// Stub components — implement in src/components/
function DateRangePicker() { return <div className="text-sm text-gray-500">Last 30 days ▾</div> }
function KpiSkeleton()     { return <div className="h-28 bg-gray-100 rounded-xl animate-pulse" /> }
function ChartSkeleton()   { return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" /> }
function TableSkeleton()   { return <div className="h-80 bg-gray-100 rounded-xl animate-pulse" /> }
function KpiCards()        { return <div className="h-28 bg-white border rounded-xl p-4">KPI Cards</div> }
function CostTrendChart()  { return <div className="h-64 bg-white border rounded-xl p-4">Cost Trend Chart</div> }
function ProviderBreakdown() { return <div className="h-64 bg-white border rounded-xl p-4">Provider Breakdown</div> }
function TeamLeaderboard() { return <div className="h-80 bg-white border rounded-xl p-4">Team Leaderboard</div> }
function AlertFeed()       { return <div className="h-80 bg-white border rounded-xl p-4">Alert Feed</div> }
