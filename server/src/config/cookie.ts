import type { CookieOptions } from 'express'

export const AUTH_COOKIE_NAME = 'token'

const isProd = process.env.NODE_ENV === 'production'

export const authCookieOptions: CookieOptions = {
  httpOnly: true, // JS(localStorage 등)로 접근 불가 — XSS로부터 토큰을 보호한다.
  secure: isProd, // 운영 환경(HTTPS)에서만 secure 플래그 적용, 로컬 http 개발 환경은 예외.
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
}
