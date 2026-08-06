import type { DeploymentStatus } from '../types'

export const STATUS_STYLES: Record<DeploymentStatus, string> = {
  READY: 'bg-green-100 text-green-700',
  BUILDING: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-red-100 text-red-700',
  CANCELED: 'bg-gray-200 text-gray-600',
}

export const STATUS_LABEL: Record<DeploymentStatus, string> = {
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
