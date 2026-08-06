import type { DeploymentStatus } from '../../types'
import { STATUS_LABEL, STATUS_STYLES } from '../../utils/deploymentStatus'

export function StatusBadge({ status }: { status: DeploymentStatus | null }) {
  if (!status) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        배포 없음
      </span>
    )
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
