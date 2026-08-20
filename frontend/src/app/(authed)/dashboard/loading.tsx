export default function DashboardLoading() {
  return (
    <div className="space-y-6 pt-4 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-accent/40 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-accent/20 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-accent/30 rounded-xl animate-pulse" />
          <div className="h-9 w-36 bg-primary/20 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* KPI Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-accent/30 rounded-2xl border border-white/5 animate-pulse p-5 flex flex-col justify-between">
            <div className="h-4 w-28 bg-accent/50 rounded" />
            <div className="h-8 w-20 bg-accent/60 rounded-lg" />
            <div className="h-3 w-36 bg-accent/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-accent/20 rounded-2xl border border-white/5 animate-pulse" />
        <div className="h-96 bg-accent/20 rounded-2xl border border-white/5 animate-pulse" />
      </div>
    </div>
  );
}
