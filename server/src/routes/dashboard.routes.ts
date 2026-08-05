import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { getGithubAccessToken } from '../services/githubTokenStore'
import { getUserWithVercelToken } from '../services/userService'
import { decrypt } from '../utils/crypto'
import { handleApiError } from '../utils/handleApiError'
import { fetchAllGithubRepos, type GithubRepo } from '../services/github'
import {
  fetchAllVercelProjects,
  fetchLatestDeployment,
  getLinkedRepoFullName,
  type VercelProject,
} from '../services/vercel'
import { dashboardCache } from '../services/caches'
import type { DashboardApiResponse, DashboardResponse, MatchedRepo } from '../types/dashboard'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

// GET /api/dashboard → GitHub 저장소 × Vercel 프로젝트를 저장소 full_name(link.repo) 기준으로 매칭해 병합 반환.
// 결과는 사용자별로 5분간 캐싱하고, 새로 조회하다 실패하면(rate limit 등) 만료된 캐시라도 stale=true로 내려준다.
dashboardRouter.get('/', async (req, res) => {
  const userId = req.user!.id

  const fresh = dashboardCache.getFresh(userId)
  if (fresh) {
    res.json({ ...fresh, stale: false, cachedAt: new Date().toISOString() } satisfies DashboardApiResponse)
    return
  }

  const githubToken = getGithubAccessToken(userId)
  if (!githubToken) {
    res.status(401).json({ message: 'GitHub 연동 정보가 만료되었습니다. 다시 로그인해주세요.' })
    return
  }

  const dbUser = await getUserWithVercelToken(userId)
  if (!dbUser?.vercelToken) {
    res.status(404).json({ message: 'Vercel이 연동되어 있지 않습니다.' })
    return
  }

  try {
    const vercelToken = decrypt(dbUser.vercelToken.encryptedToken)

    const [githubRepos, vercelProjects] = await Promise.all([
      fetchAllGithubRepos(githubToken),
      fetchAllVercelProjects(vercelToken),
    ])

    const matched: MatchedRepo[] = []
    const unmatchedRepos: GithubRepo[] = []
    const matchedVercelProjectIds = new Set<string>()

    for (const repo of githubRepos) {
      const vercelProject = vercelProjects.find(
        (project) =>
          getLinkedRepoFullName(project.linkedRepo)?.toLowerCase() === repo.full_name.toLowerCase(),
      )

      if (!vercelProject) {
        unmatchedRepos.push(repo)
        continue
      }

      matchedVercelProjectIds.add(vercelProject.id)
      const latestDeployment = await fetchLatestDeployment(vercelToken, vercelProject.id)
      matched.push({ repo, vercelProject, latestDeployment })
    }

    const unmatchedVercelProjects: VercelProject[] = vercelProjects.filter(
      (project) => !matchedVercelProjectIds.has(project.id),
    )

    const result: DashboardResponse = { matched, unmatchedRepos, unmatchedVercelProjects }
    dashboardCache.set(userId, result)
    res.json({ ...result, stale: false, cachedAt: new Date().toISOString() } satisfies DashboardApiResponse)
  } catch (err) {
    const staleEntry = dashboardCache.getStale(userId)
    if (staleEntry) {
      res.json({
        ...staleEntry.data,
        stale: true,
        cachedAt: new Date(staleEntry.cachedAt).toISOString(),
      } satisfies DashboardApiResponse)
      return
    }

    handleApiError(err, req, res, '대시보드 데이터를 구성하는 중 오류가 발생했습니다.')
  }
})
