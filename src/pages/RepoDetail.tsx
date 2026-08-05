import { Link, useParams } from 'react-router-dom'
import { CommitList } from '../components/repoDetail/CommitList'
import { DeploymentTimeline } from '../components/repoDetail/DeploymentTimeline'
import { useRepoDetails } from '../hooks/useRepoDetails'

export function RepoDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error, refetch } = useRepoDetails(id)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        ← 대시보드로 돌아가기
      </Link>

      {isLoading && (
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-1/3 rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-100" />
          <div className="h-40 rounded bg-gray-100" />
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>저장소 정보를 불러오지 못했습니다. {(error as Error)?.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 rounded-md border border-red-300 px-3 py-1 text-sm hover:bg-red-100"
          >
            다시 시도
          </button>
        </div>
      )}

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-4">
            <div>
              <a
                href={data.repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-xl font-semibold text-gray-900 hover:underline"
              >
                {data.repo.name}
              </a>
              <p className="mt-1 text-sm text-gray-500">
                {data.repo.description ?? '설명 없음'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-0.5">
                  브랜치: {data.repo.default_branch}
                </span>
                {data.repo.language && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5">{data.repo.language}</span>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">최근 커밋</h2>
              <CommitList commits={data.recentCommits} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-sm font-semibold text-gray-700">배포 히스토리</h2>
              {data.vercelProject ? (
                <p className="text-xs text-gray-500">
                  연결된 Vercel 프로젝트: {data.vercelProject.name}
                </p>
              ) : (
                <p className="text-xs text-gray-500">연결된 Vercel 프로젝트가 없습니다.</p>
              )}
            </div>
            <DeploymentTimeline deployments={data.deployments} />
          </section>
        </div>
      )}
    </div>
  )
}
