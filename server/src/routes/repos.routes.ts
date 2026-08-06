import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { getGithubAccessToken } from '../services/githubTokenStore'
import { fetchAllGithubRepos, fetchGithubRepoById, fetchRecentCommits } from '../services/github'
import { fetchAllVercelProjects, fetchDeployments, getLinkedRepoFullName } from '../services/vercel'
import { getUserWithVercelToken } from '../services/userService'
import { getHiddenRepoIds, hideRepo, unhideRepo } from '../services/hiddenRepos'
import { decrypt } from '../utils/crypto'
import { handleApiError } from '../utils/handleApiError'
import { reposCache, dashboardCache } from '../services/caches'
import type { RepoDetailsResponse } from '../types/repoDetails'

export const reposRouter = Router()

const RECENT_COMMITS_COUNT = 5
const DEPLOYMENT_HISTORY_COUNT = 10

reposRouter.use(requireAuth)

// GET /api/repos → 로그인한 사용자의 GitHub 저장소 전체 목록 (필요한 필드만 추려서 반환).
// 5분간 캐싱하고, 새로 조회하다 실패하면 만료된 캐시라도 stale=true로 내려준다.
reposRouter.get('/', async (req, res) => {
  const userId = req.user!.id

  const fresh = reposCache.getFresh(userId)
  if (fresh) {
    res.json({ data: fresh, stale: false, cachedAt: new Date().toISOString() })
    return
  }

  const accessToken = await getGithubAccessToken(userId)
  if (!accessToken) {
    res.status(401).json({ message: 'GitHub 연동 정보가 만료되었습니다. 다시 로그인해주세요.' })
    return
  }

  try {
    const [repos, hiddenIds] = await Promise.all([
      fetchAllGithubRepos(accessToken),
      getHiddenRepoIds(userId),
    ])
    const visibleRepos = repos.filter((repo) => !hiddenIds.includes(repo.id))
    reposCache.set(userId, visibleRepos)
    res.json({ data: visibleRepos, stale: false, cachedAt: new Date().toISOString() })
  } catch (err) {
    const staleEntry = reposCache.getStale(userId)
    if (staleEntry) {
      res.json({
        data: staleEntry.data,
        stale: true,
        cachedAt: new Date(staleEntry.cachedAt).toISOString(),
      })
      return
    }

    handleApiError(err, req, res, 'GitHub 저장소 목록 조회 중 오류가 발생했습니다.')
  }
})

// GET /api/repos/:id/details → 저장소 기본정보+최근 커밋 5개, 연결된 Vercel 프로젝트의 배포 히스토리 10건
reposRouter.get('/:id/details', async (req, res) => {
  const accessToken = await getGithubAccessToken(req.user!.id)
  if (!accessToken) {
    res.status(401).json({ message: 'GitHub 연동 정보가 만료되었습니다. 다시 로그인해주세요.' })
    return
  }

  try {
    const repo = await fetchGithubRepoById(accessToken, req.params.id)
    if (!repo) {
      res.status(404).json({ message: '저장소를 찾을 수 없습니다.' })
      return
    }

    const recentCommits = await fetchRecentCommits(accessToken, repo.full_name, RECENT_COMMITS_COUNT)

    let vercelProject: RepoDetailsResponse['vercelProject'] = null
    let deployments: RepoDetailsResponse['deployments'] = []

    const dbUser = await getUserWithVercelToken(req.user!.id)
    if (dbUser?.vercelToken) {
      const vercelToken = decrypt(dbUser.vercelToken.encryptedToken)
      const vercelProjects = await fetchAllVercelProjects(vercelToken)
      const match = vercelProjects.find(
        (project) =>
          getLinkedRepoFullName(project.linkedRepo)?.toLowerCase() === repo.full_name.toLowerCase(),
      )

      if (match) {
        vercelProject = match
        deployments = await fetchDeployments(vercelToken, match.id, DEPLOYMENT_HISTORY_COUNT)
      }
    }

    const result: RepoDetailsResponse = { repo, recentCommits, vercelProject, deployments }
    res.json(result)
  } catch (err) {
    handleApiError(err, req, res, '저장소 상세 정보를 가져오는 중 오류가 발생했습니다.')
  }
})

// GET /api/repos/hidden → 숨긴 저장소 목록 (설정 화면에서 복원할 때 보여주기 위함)
reposRouter.get('/hidden', async (req, res) => {
  const userId = req.user!.id

  try {
    const hiddenIds = await getHiddenRepoIds(userId)
    if (hiddenIds.length === 0) {
      res.json({ data: [] })
      return
    }

    const accessToken = await getGithubAccessToken(userId)
    if (!accessToken) {
      res.status(401).json({ message: 'GitHub 연동 정보가 만료되었습니다. 다시 로그인해주세요.' })
      return
    }

    const allRepos = await fetchAllGithubRepos(accessToken)
    const hiddenSet = new Set(hiddenIds)
    res.json({ data: allRepos.filter((repo) => hiddenSet.has(repo.id)) })
  } catch (err) {
    handleApiError(err, req, res, '숨긴 저장소 목록을 가져오는 중 오류가 발생했습니다.')
  }
})

// POST /api/repos/:id/hide → 대시보드/저장소 목록에서 이 저장소를 숨긴다 (GitHub에는 영향 없음)
reposRouter.post('/:id/hide', async (req, res) => {
  const userId = req.user!.id

  try {
    await hideRepo(userId, Number(req.params.id))
    reposCache.invalidate(userId)
    dashboardCache.invalidate(userId)
    res.status(204).end()
  } catch (err) {
    handleApiError(err, req, res, '저장소를 숨기는 중 오류가 발생했습니다.')
  }
})

// DELETE /api/repos/:id/hide → 숨김 해제
reposRouter.delete('/:id/hide', async (req, res) => {
  const userId = req.user!.id

  try {
    await unhideRepo(userId, Number(req.params.id))
    reposCache.invalidate(userId)
    dashboardCache.invalidate(userId)
    res.status(204).end()
  } catch (err) {
    handleApiError(err, req, res, '저장소 숨기기 해제 중 오류가 발생했습니다.')
  }
})
