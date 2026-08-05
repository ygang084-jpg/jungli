import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { env } from './config/env'
import { requestLogger } from './middleware/requestLogger'
import { authRouter } from './routes/auth.routes'
import { dashboardRouter } from './routes/dashboard.routes'
import { reposRouter } from './routes/repos.routes'
import { vercelRouter } from './routes/vercel.routes'
import { RateLimitError, ExternalApiError } from './utils/errors'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true, // HttpOnly 쿠키를 주고받으려면 필요
    }),
  )
  app.use(express.json())
  app.use(cookieParser())
  app.use(requestLogger)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/repos', reposRouter)
  app.use('/api/vercel', vercelRouter)
  app.use('/api/dashboard', dashboardRouter)

  // 라우트 핸들러에서 던지거나 reject한 에러를 전부 JSON으로 응답한다 (Express 기본 HTML 에러 페이지 방지).
  // 라우트 자체에서 handleApiError로 처리하지 못하고 흘러나온 에러에 대한 최종 안전망.
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const context = `${req.requestId ?? '-'} ${req.method} ${req.originalUrl}`

    if (err instanceof RateLimitError) {
      console.warn(`[${new Date().toISOString()}] ${context} → rate limited (${err.provider})`)
      res.status(429).json({ message: err.message, code: 'RATE_LIMITED', provider: err.provider })
      return
    }

    if (err instanceof ExternalApiError) {
      console.error(`[${new Date().toISOString()}] ${context} →`, err)
      res.status(502).json({ message: err.message, code: 'EXTERNAL_API_ERROR', provider: err.provider })
      return
    }

    console.error(`[${new Date().toISOString()}] ${context} →`, err)
    res.status(500).json({ message: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' })
  })

  return app
}
