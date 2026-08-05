import type { DeploymentStatus } from './index'
import type { GithubRepo } from './github'
import type { VercelProject } from './vercel'

export interface LatestDeployment {
  id: string
  url: string | null
  status: DeploymentStatus
  createdAt: string | null
  commitMessage: string | null
}

export interface MatchedRepo {
  repo: GithubRepo
  vercelProject: VercelProject
  latestDeployment: LatestDeployment | null
}

export interface DashboardResponse {
  matched: MatchedRepo[]
  unmatchedRepos: GithubRepo[]
  unmatchedVercelProjects: VercelProject[]
  stale: boolean
  cachedAt: string
}
