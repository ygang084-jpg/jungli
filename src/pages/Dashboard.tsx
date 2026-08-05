import { isAxiosError } from 'axios'
import { useMemo, useState } from 'react'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { MatchedRepoGrid } from '../components/dashboard/MatchedRepoGrid'
import { MatchedRepoTable } from '../components/dashboard/MatchedRepoTable'
import { StaleDataBanner } from '../components/dashboard/StaleDataBanner'
import { StatusFilterButtons, type StatusFilter } from '../components/dashboard/StatusFilterButtons'
import { UnmatchedReposSection } from '../components/dashboard/UnmatchedReposSection'
import { ViewToggle, type ViewMode } from '../components/dashboard/ViewToggle'
import { VercelConnectBanner } from '../components/VercelConnectBanner'
import { useDashboard } from '../hooks/useDashboard'

export function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboard()
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const notConnected = isAxiosError(error) && error.response?.status === 404
  const isRateLimited = isAxiosError(error) && error.response?.status === 429

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = { ALL: 0, READY: 0, ERROR: 0, BUILDING: 0 }
    if (!data) return base

    base.ALL = data.matched.length
    for (const item of data.matched) {
      const status = item.latestDeployment?.status
      if (status === 'READY' || status === 'ERROR' || status === 'BUILDING') {
        base[status] += 1
      }
    }
    return base
  }, [data])

  const filteredMatched = useMemo(() => {
    if (!data) return []
    if (statusFilter === 'ALL') return data.matched
    return data.matched.filter((item) => item.latestDeployment?.status === statusFilter)
  }, [data, statusFilter])

  if (isLoading) {
    return <DashboardSkeleton viewMode={viewMode} />
  }

  if (notConnected) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-gray-600">아직 Vercel이 연동되어 있지 않아 대시보드를 구성할 수 없습니다.</p>
        <div className="w-full max-w-xl">
          <VercelConnectBanner />
        </div>
      </div>
    )
  }

  if (isRateLimited) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p>GitHub/Vercel API 요청이 너무 많아 잠시 제한되었습니다. 잠시 후 다시 시도해주세요.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 rounded-md border border-amber-300 px-3 py-1 text-sm hover:bg-amber-100"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>대시보드를 불러오지 못했습니다. {(error as Error)?.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 rounded-md border border-red-300 px-3 py-1 text-sm hover:bg-red-100"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (!data) return null

  const isEmpty = data.matched.length === 0 && data.unmatchedRepos.length === 0

  if (isEmpty) {
    return <p className="py-16 text-center text-sm text-gray-500">저장소가 없습니다.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {data.stale && <StaleDataBanner cachedAt={data.cachedAt} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusFilterButtons value={statusFilter} onChange={setStatusFilter} counts={counts} />
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {filteredMatched.length === 0 ? (
        <p className="text-sm text-gray-500">조건에 맞는 배포가 없습니다.</p>
      ) : viewMode === 'card' ? (
        <MatchedRepoGrid items={filteredMatched} />
      ) : (
        <MatchedRepoTable items={filteredMatched} />
      )}

      {data.unmatchedRepos.length > 0 && <UnmatchedReposSection repos={data.unmatchedRepos} />}
    </div>
  )
}
