import type { MouseEvent } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useHideRepo } from '../../hooks/useRepos'
import type { GithubRepo } from '../../types/github'

export function UnmatchedReposSection({ repos }: { repos: GithubRepo[] }) {
  const navigate = useNavigate()
  const hideRepo = useHideRepo()

  const handleManualConnect = (e: MouseEvent) => {
    e.stopPropagation()
    toast('수동 연결 기능은 아직 준비 중입니다.', { icon: 'ℹ️' })
  }

  const handleHide = (e: MouseEvent, repo: GithubRepo) => {
    e.stopPropagation()
    hideRepo.mutate(repo.id, {
      onSuccess: () => toast.success(`${repo.name}을(를) 숨겼습니다. 설정에서 다시 보이게 할 수 있어요.`),
      onError: () => toast.error('저장소를 숨기지 못했습니다. 잠시 후 다시 시도해주세요.'),
    })
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-700">
        매칭되지 않은 저장소 ({repos.length})
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <div
            key={repo.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/repo/${repo.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') navigate(`/repo/${repo.id}`)
            }}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-gray-300 bg-white p-3 text-sm hover:border-gray-400"
          >
            <span className="truncate font-medium text-gray-800">{repo.name}</span>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleManualConnect}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                Vercel 프로젝트 수동 연결
              </button>
              <button
                type="button"
                onClick={(e) => handleHide(e, repo)}
                disabled={hideRepo.isPending}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                숨기기
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
