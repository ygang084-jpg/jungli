import type { MouseEvent } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { GithubRepo } from '../../types/github'

export function UnmatchedReposSection({ repos }: { repos: GithubRepo[] }) {
  const navigate = useNavigate()

  const handleManualConnect = (e: MouseEvent) => {
    e.stopPropagation()
    toast('수동 연결 기능은 아직 준비 중입니다.', { icon: 'ℹ️' })
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
            <button
              type="button"
              onClick={handleManualConnect}
              className="shrink-0 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              Vercel 프로젝트 수동 연결
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
