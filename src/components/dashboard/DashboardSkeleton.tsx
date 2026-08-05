import type { ViewMode } from './ViewToggle'

export function DashboardSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'table') {
    return (
      <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="h-10 border-b border-gray-200 bg-gray-50" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-gray-100 last:border-0" />
        ))}
      </div>
    )
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 h-4 w-2/3 rounded bg-gray-200" />
          <div className="mb-4 h-3 w-1/2 rounded bg-gray-100" />
          <div className="h-3 w-full rounded bg-gray-100" />
        </div>
      ))}
    </section>
  )
}
