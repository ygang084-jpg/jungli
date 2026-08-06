import { Router } from 'express'
import { env } from '../config/env'
import { AUTH_COOKIE_NAME, authCookieOptions } from '../config/cookie'
import { setGithubAccessToken, deleteGithubAccessToken } from '../services/githubTokenStore'
import { signUserToken, verifyUserToken } from '../utils/jwt'
import { fetchWithRetry } from '../utils/fetchWithRetry'
import { handleApiError } from '../utils/handleApiError'

export const authRouter = Router()

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_USER_URL = 'https://api.github.com/user'

// GET /api/auth/github → GitHub 인증 페이지로 리다이렉트
authRouter.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: env.github.clientId,
    scope: 'read:user repo',
    redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/github/callback`,
  })
  res.redirect(`${GITHUB_AUTHORIZE_URL}?${params.toString()}`)
})

// GET /api/auth/github/callback → 코드를 토큰으로 교환하고 JWT를 HttpOnly 쿠키로 발급
authRouter.get('/github/callback', async (req, res) => {
  const code = req.query.code as string | undefined
  if (!code) {
    res.status(400).json({ message: 'code 파라미터가 없습니다.' })
    return
  }

  try {
    const tokenRes = await fetchWithRetry(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.github.clientId,
        client_secret: env.github.clientSecret,
        code,
      }),
    })
    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string }

    if (!tokenData.access_token) {
      res.status(401).json({ message: 'GitHub 토큰 교환에 실패했습니다.', detail: tokenData.error })
      return
    }

    const userRes = await fetchWithRetry(GITHUB_USER_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const githubUser = (await userRes.json()) as {
      id: number
      login: string
      avatar_url: string
    }
    const userId = String(githubUser.id)

    // GitHub access token은 암호화하여 DB에만 보관한다. 프론트/쿠키/JWT에는 절대 담지 않는다.
    await setGithubAccessToken(userId, githubUser.login, githubUser.avatar_url, tokenData.access_token)

    const jwtToken = signUserToken({
      id: userId,
      githubLogin: githubUser.login,
      avatarUrl: githubUser.avatar_url,
    })

    res.cookie(AUTH_COOKIE_NAME, jwtToken, authCookieOptions)
    res.redirect(`${env.clientOrigin}/dashboard`)
  } catch (err) {
    handleApiError(err, req, res, 'GitHub 로그인 처리 중 오류가 발생했습니다.')
  }
})

// GET /api/auth/me → 로그인 여부 확인 (비로그인이어도 401이 아니라 null을 반환한다)
authRouter.get('/me', (req, res) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME]
  const user = token ? verifyUserToken(token) : null
  res.json(user)
})

// POST /api/auth/logout → 쿠키 삭제 + 서버에 보관 중인 GitHub 토큰 폐기
authRouter.post('/logout', async (req, res) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME]
  const user = token ? verifyUserToken(token) : null
  if (user) {
    await deleteGithubAccessToken(user.id)
  }

  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions)
  res.status(204).end()
})
