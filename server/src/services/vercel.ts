import { fetchWithRetry } from '../utils/fetchWithRetry'
import { ExternalApiError, RateLimitError } from '../utils/errors'

const VERCEL_API_BASE = 'https://api.vercel.com'
const MAX_PAGES = 20 // 안전장치

export interface VercelLinkedRepo {
  type: string | null
  repo: string | null
  org: string | null
}

export interface VercelProject {
  id: string
  name: string
  productionUrl: string | null
  linkedRepo: VercelLinkedRepo | null
}

export type DeploymentStatus = 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'

export interface LatestDeployment {
  id: string
  url: string | null
  status: DeploymentStatus
  createdAt: string | null
  commitMessage: string | null
}

interface VercelProjectApiResponse {
  id: string
  name: string
  link?: { type?: string; org?: string; repo?: string }
  targets?: { production?: { domain?: string; url?: string } }
}

interface VercelDeploymentApiResponse {
  uid?: string
  id?: string
  url?: string
  state?: string
  readyState?: string
  createdAt?: number
  created?: number
  meta?: { githubCommitMessage?: string }
}

function toDeploymentSummary(deployment: VercelDeploymentApiResponse): LatestDeployment {
  const createdAtMs = deployment.createdAt ?? deployment.created

  return {
    id: deployment.uid ?? deployment.id ?? '',
    url: deployment.url ? `https://${deployment.url}` : null,
    status: mapDeploymentStatus(deployment.readyState ?? deployment.state),
    createdAt: createdAtMs ? new Date(createdAtMs).toISOString() : null,
    commitMessage: deployment.meta?.githubCommitMessage ?? null,
  }
}

function mapDeploymentStatus(raw?: string): DeploymentStatus {
  switch (raw) {
    case 'READY':
      return 'READY'
    case 'ERROR':
      return 'ERROR'
    case 'CANCELED':
      return 'CANCELED'
    case 'QUEUED':
    case 'INITIALIZING':
    case 'BUILDING':
      return 'BUILDING'
    default:
      // 알 수 없는 상태값은 "진행 중"으로 취급한다 — ERROR/CANCELED로 잘못 단정하지 않기 위한 안전한 기본값.
      return 'BUILDING'
  }
}

function assertOk(response: Response): void {
  if (response.ok) return
  if (response.status === 429) throw new RateLimitError('vercel')
  throw new ExternalApiError(
    `Vercel API 요청이 실패했습니다 (status: ${response.status})`,
    response.status,
    'vercel',
  )
}

// Vercel project.link.repo/org를 GitHub의 "owner/repo" 형식으로 정규화한다.
export function getLinkedRepoFullName(linkedRepo: VercelLinkedRepo | null): string | null {
  if (!linkedRepo?.repo) return null
  if (linkedRepo.repo.includes('/')) return linkedRepo.repo
  if (!linkedRepo.org) return null
  return `${linkedRepo.org}/${linkedRepo.repo}`
}

// GET /v9/projects를 페이지네이션 끝까지 순회해 필요한 필드만 추려서 반환한다.
export async function fetchAllVercelProjects(token: string): Promise<VercelProject[]> {
  const projects: VercelProjectApiResponse[] = []
  let cursor: string | undefined

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = new URL(`${VERCEL_API_BASE}/v9/projects`)
    url.searchParams.set('limit', '100')
    if (cursor) url.searchParams.set('until', cursor)

    const response = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${token}` } })
    assertOk(response)

    const data = (await response.json()) as {
      projects: VercelProjectApiResponse[]
      pagination?: { next?: number | null }
    }
    projects.push(...data.projects)

    if (!data.pagination?.next) break
    cursor = String(data.pagination.next)
  }

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    productionUrl:
      project.targets?.production?.domain ?? project.targets?.production?.url ?? null,
    linkedRepo: project.link
      ? {
          type: project.link.type ?? null,
          repo: project.link.repo ?? null,
          org: project.link.org ?? null,
        }
      : null,
  }))
}

// GET /v6/deployments?projectId=...&limit=N 로 프로젝트의 최근 배포 목록을 가져온다.
// 배포 히스토리는 대시보드 카드 하나를 위한 보조 정보라서, 재시도 끝에도 실패하면
// 전체 요청을 막지 않고 빈 배열로 낮춘다(호출부에서 "배포 없음"으로 표시됨).
export async function fetchDeployments(
  token: string,
  projectId: string,
  limit: number,
): Promise<LatestDeployment[]> {
  const url = new URL(`${VERCEL_API_BASE}/v6/deployments`)
  url.searchParams.set('projectId', projectId)
  url.searchParams.set('limit', String(limit))

  let response: Response
  try {
    response = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${token}` } })
  } catch (err) {
    console.error(`Vercel 배포 목록 조회 실패 (projectId: ${projectId}):`, err)
    return []
  }

  if (!response.ok) return []

  const data = (await response.json()) as { deployments?: VercelDeploymentApiResponse[] }
  return (data.deployments ?? []).map(toDeploymentSummary)
}

// 가장 최근 배포 1건만 필요한 경우의 편의 함수.
export async function fetchLatestDeployment(
  token: string,
  projectId: string,
): Promise<LatestDeployment | null> {
  const [latest] = await fetchDeployments(token, projectId, 1)
  return latest ?? null
}
