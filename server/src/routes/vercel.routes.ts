import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { prisma } from '../lib/prisma'
import { encrypt, decrypt } from '../utils/crypto'
import { fetchWithRetry } from '../utils/fetchWithRetry'
import { handleApiError } from '../utils/handleApiError'
import { fetchAllVercelProjects } from '../services/vercel'
import { dashboardCache, vercelProjectsCache } from '../services/caches'
import { getUserWithVercelToken } from '../services/userService'

export const vercelRouter = Router()

vercelRouter.use(requireAuth)

interface VercelUserResponse {
  user?: { id: string; email?: string }
}

// 로그인한 GitHub 사용자를 DB의 User 행으로 upsert한다 (githubId 기준).
// 인증은 JWT/githubTokenStore로 이미 처리되어 있고, 여기서는 Vercel 연동을 걸기 위한 FK 대상만 보장한다.
async function upsertCurrentUser(githubId: string, githubLogin: string, avatarUrl: string) {
  return prisma.user.upsert({
    where: { githubId },
    update: { githubLogin, avatarUrl },
    create: { githubId, githubLogin, avatarUrl },
  })
}

// POST /api/vercel/connect → 토큰 유효성 확인 후 암호화하여 DB에 저장
vercelRouter.post('/connect', async (req, res) => {
  const { token } = req.body as { token?: string }
  if (!token) {
    res.status(400).json({ message: 'Vercel Personal Access Token을 입력해주세요.' })
    return
  }

  try {
    const verifyRes = await fetchWithRetry('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (verifyRes.status === 429) {
      res.status(429).json({
        message: 'Vercel API 요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
        code: 'RATE_LIMITED',
        provider: 'vercel',
      })
      return
    }

    if (!verifyRes.ok) {
      res.status(400).json({ message: '유효하지 않은 Vercel 토큰입니다.' })
      return
    }

    const verifyData = (await verifyRes.json()) as VercelUserResponse

    const dbUser = await upsertCurrentUser(
      req.user!.id,
      req.user!.githubLogin,
      req.user!.avatarUrl,
    )

    const encryptedToken = encrypt(token)

    await prisma.vercelToken.upsert({
      where: { userId: dbUser.id },
      update: { encryptedToken, vercelUserId: verifyData.user?.id },
      create: { userId: dbUser.id, encryptedToken, vercelUserId: verifyData.user?.id },
    })

    // 토큰이 새로 연결/교체되었으니 이전 토큰 기준으로 캐싱된 결과는 버린다.
    dashboardCache.invalidate(req.user!.id)
    vercelProjectsCache.invalidate(req.user!.id)

    res.json({ connected: true })
  } catch (err) {
    handleApiError(err, req, res, 'Vercel 연동 처리 중 오류가 발생했습니다.')
  }
})

// GET /api/vercel/projects → 저장된 토큰으로 Vercel 프로젝트 목록 + 연결된 GitHub 저장소 정보 반환.
// 5분간 캐싱하고, 새로 조회하다 실패하면 만료된 캐시라도 stale=true로 내려준다.
vercelRouter.get('/projects', async (req, res) => {
  const userId = req.user!.id

  const fresh = vercelProjectsCache.getFresh(userId)
  if (fresh) {
    res.json({ data: fresh, stale: false, cachedAt: new Date().toISOString() })
    return
  }

  const dbUser = await getUserWithVercelToken(userId)
  if (!dbUser?.vercelToken) {
    res.status(404).json({ message: 'Vercel이 연동되어 있지 않습니다.' })
    return
  }

  try {
    const token = decrypt(dbUser.vercelToken.encryptedToken)
    const projects = await fetchAllVercelProjects(token)
    vercelProjectsCache.set(userId, projects)
    res.json({ data: projects, stale: false, cachedAt: new Date().toISOString() })
  } catch (err) {
    const staleEntry = vercelProjectsCache.getStale(userId)
    if (staleEntry) {
      res.json({
        data: staleEntry.data,
        stale: true,
        cachedAt: new Date(staleEntry.cachedAt).toISOString(),
      })
      return
    }

    handleApiError(err, req, res, 'Vercel 프로젝트 조회 중 오류가 발생했습니다.')
  }
})
