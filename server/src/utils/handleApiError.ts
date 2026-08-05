import type { Request, Response } from 'express'
import { ExternalApiError, RateLimitError } from './errors'

// 라우트의 catch 블록에서 공통으로 호출한다 — rate limit은 429로, 그 외 외부 API 실패는 502로,
// 나머지는 500으로 매핑하고 서버 로그에는 항상 요청 컨텍스트와 함께 원인을 남긴다.
export function handleApiError(err: unknown, req: Request, res: Response, fallbackMessage: string) {
  if (err instanceof RateLimitError) {
    console.warn(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → rate limited (${err.provider})`)
    res.status(429).json({ message: err.message, code: 'RATE_LIMITED', provider: err.provider })
    return
  }

  if (err instanceof ExternalApiError) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err)
    res.status(502).json({ message: err.message, code: 'EXTERNAL_API_ERROR', provider: err.provider })
    return
  }

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err)
  res.status(500).json({ message: fallbackMessage, code: 'INTERNAL_ERROR' })
}
