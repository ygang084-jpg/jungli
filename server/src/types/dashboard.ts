import type { GithubRepo } from '../services/github'
import type { LatestDeployment, VercelProject } from '../services/vercel'

export interface MatchedRepo {
  repo: GithubRepo
  vercelProject: VercelProject
  latestDeployment: LatestDeployment | null
}

export interface DashboardResponse {
  matched: MatchedRepo[]
  unmatchedRepos: GithubRepo[]
  unmatchedVercelProjects: VercelProject[]
}

// 실제 HTTP 응답 형태: 캐시에 저장된 순수 데이터에 "최신 정보인지" 메타데이터를 얹은 것.
export interface DashboardApiResponse extends DashboardResponse {
  stale: boolean
  cachedAt: string
}
