import type { CommitSummary, GithubRepo } from '../services/github'
import type { LatestDeployment, VercelProject } from '../services/vercel'

export interface RepoDetailsResponse {
  repo: GithubRepo
  recentCommits: CommitSummary[]
  vercelProject: VercelProject | null
  deployments: LatestDeployment[]
}
