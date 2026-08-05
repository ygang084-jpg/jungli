import type { NextFunction, Request, Response } from 'express'
import { AUTH_COOKIE_NAME } from '../config/cookie'
import { verifyUserToken } from '../utils/jwt'

// HttpOnly 쿠키에 담긴 JWT를 검증해 req.user에 채운다. 없거나 유효하지 않으면 401.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME]
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    res.status(401).json({ message: '로그인이 필요합니다.' })
    return
  }

  req.user = user
  next()
}
