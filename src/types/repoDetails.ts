import type { LatestDeployment } from './dashboard'
import type { GithubRepo } from './github'
import type { VercelProject } from './vercel'

export interface CommitSummary {
  sha: string
  message: string
  author: string | null
  date: string | null
  url: string
}

export interface RepoDetailsResponse {
  repo: GithubRepo
  recentCommits: CommitSummary[]
  vercelProject: VercelProject | null
  deployments: LatestDeployment[]
}
