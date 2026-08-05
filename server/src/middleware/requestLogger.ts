import { randomUUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'

// 모든 요청에 대해 메서드/경로/상태코드/응답시간을 로그로 남긴다.
// 각 요청에 X-Request-Id를 붙여서, 에러 발생 시(app.ts의 전역 에러 핸들러) 같은 요청의 로그를 서로 연결해 추적할 수 있게 한다.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID()
  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)

  const startedAt = Date.now()

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt
    const line = `[${new Date().toISOString()}] ${requestId} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`

    if (res.statusCode >= 500) {
      console.error(line)
    } else if (res.statusCode >= 400) {
      console.warn(line)
    } else {
      console.log(line)
    }
  })

  next()
}
