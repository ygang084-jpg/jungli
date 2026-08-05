import type { DeploymentStatus } from '../../types'

const STATUS_STYLES: Record<DeploymentStatus, string> = {
  READY: 'bg-green-100 text-green-700',
  BUILDING: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-red-100 text-red-700',
  CANCELED: 'bg-gray-200 text-gray-600',
}

const STATUS_LABEL: Record<DeploymentStatus, string> = {
  READY: 'Ready',
  BUILDING: 'Building',
  ERROR: 'Error',
  CANCELED: 'Canceled',
}

// 타임라인 등에서 뱃지 없이 점(dot)만 필요할 때 재사용하는 단색 배경 맵.
export const STATUS_DOT_COLOR: Record<DeploymentStatus, string> = {
  READY: 'bg-green-500',
  BUILDING: 'bg-yellow-500',
  ERROR: 'bg-red-500',
  CANCELED: 'bg-gray-400',
}

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
