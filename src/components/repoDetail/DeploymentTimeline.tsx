import type { LatestDeployment } from '../../types/dashboard'
import { formatDateTime } from '../../utils/formatDate'
import { STATUS_DOT_COLOR } from '../../utils/deploymentStatus'
import { StatusBadge } from '../dashboard/StatusBadge'

export function DeploymentTimeline({ deployments }: { deployments: LatestDeployment[] }) {
  if (deployments.length === 0) {
    return <p className="text-sm text-gray-500">배포 내역이 없습니다.</p>
  }

  return (
    <ol className="relative border-l border-gray-200 pl-5">
      {deployments.map((deployment) => (
        <li key={deployment.id} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${STATUS_DOT_COLOR[deployment.status]}`}
            aria-hidden
          />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={deployment.status} />
            <span className="text-xs text-gray-400">{formatDateTime(deployment.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-700">
            {deployment.commitMessage ?? '커밋 메시지 없음'}
          </p>
          {deployment.url && (
            <a
              href={deployment.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs text-blue-600 hover:underline"
            >
              배포 보기 →
            </a>
          )}
        </li>
      ))}
    </ol>
  )
}
