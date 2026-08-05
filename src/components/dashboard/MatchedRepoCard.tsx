import { useNavigate } from 'react-router-dom'
import type { MatchedRepo } from '../../types/dashboard'
import { formatDateTime } from '../../utils/formatDate'
import { StatusBadge } from './StatusBadge'

export function MatchedRepoCard({ item }: { item: MatchedRepo }) {
  const { repo, vercelProject, latestDeployment } = item
  const deployUrl = latestDeployment?.url ?? vercelProject.productionUrl
  const navigate = useNavigate()

  const goToDetails = () => navigate(`/repo/${repo.id}`)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') goToDetails()
      }}
      className="flex cursor-pointer flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="truncate font-medium text-gray-900 hover:underline"
          >
            {repo.name}
          </a>
          <p className="truncate text-xs text-gray-500">{vercelProject.name}</p>
        </div>
        <StatusBadge status={latestDeployment?.status ?? null} />
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
        {deployUrl ? (
          <a
            href={deployUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="truncate text-blue-600 hover:underline"
          >
            {deployUrl.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span>배포 URL 없음</span>
        )}
        <span className="shrink-0">{formatDateTime(latestDeployment?.createdAt)}</span>
      </div>
    </div>
  )
}
