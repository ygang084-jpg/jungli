import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useHideRepo } from '../../hooks/useRepos'
import type { MatchedRepo } from '../../types/dashboard'
import { formatDateTime } from '../../utils/formatDate'
import { StatusBadge } from './StatusBadge'

export function MatchedRepoTable({ items }: { items: MatchedRepo[] }) {
  const navigate = useNavigate()
  const hideRepo = useHideRepo()

  const handleHide = (id: number, name: string) => {
    hideRepo.mutate(id, {
      onSuccess: () => toast.success(`${name}을(를) 숨겼습니다. 설정에서 다시 보이게 할 수 있어요.`),
      onError: () => toast.error('저장소를 숨기지 못했습니다. 잠시 후 다시 시도해주세요.'),
    })
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">저장소</th>
            <th className="px-4 py-3 font-medium">Vercel 프로젝트</th>
            <th className="px-4 py-3 font-medium">상태</th>
            <th className="px-4 py-3 font-medium">배포 URL</th>
            <th className="px-4 py-3 font-medium">마지막 배포</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => {
            const deployUrl = item.latestDeployment?.url ?? item.vercelProject.productionUrl
            return (
              <tr
                key={item.repo.id}
                onClick={() => navigate(`/repo/${item.repo.id}`)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="max-w-[220px] truncate px-4 py-3">
                  <a
                    href={item.repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {item.repo.name}
                  </a>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-gray-600">
                  {item.vercelProject.name}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.latestDeployment?.status ?? null} />
                </td>
                <td className="px-4 py-3">
                  {deployUrl ? (
                    <a
                      href={deployUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:underline"
                    >
                      바로가기
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {formatDateTime(item.latestDeployment?.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleHide(item.repo.id, item.repo.name)
                    }}
                    disabled={hideRepo.isPending}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    숨기기
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
