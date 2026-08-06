import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useHideRepo } from '../../hooks/useRepos'
import type { MatchedRepo } from '../../types/dashboard'
import { formatDateTime } from '../../utils/formatDate'
import { StatusBadge } from './StatusBadge'

export function MatchedRepoCard({ item }: { item: MatchedRepo }) {
  const { repo, vercelProject, latestDeployment } = item
  const deployUrl = latestDeployment?.url ?? vercelProject.productionUrl
  const navigate = useNavigate()
  const hideRepo = useHideRepo()

  const goToDetails = () => navigate(`/repo/${repo.id}`)

  const handleHide = () => {
    hideRepo.mutate(repo.id, {
      onSuccess: () => toast.success(`${repo.name}을(를) 숨겼습니다. 설정에서 다시 보이게 할 수 있어요.`),
      onError: () => toast.error('저장소를 숨기지 못했습니다. 잠시 후 다시 시도해주세요.'),
    })
  }

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
        <div className="flex shrink-0 items-center gap-1">
          <StatusBadge status={latestDeployment?.status ?? null} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleHide()
            }}
            disabled={hideRepo.isPending}
            title="이 저장소 숨기기"
            className="rounded-md border border-gray-300 px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            숨기기
          </button>
        </div>
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
