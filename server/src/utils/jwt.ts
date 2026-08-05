import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthTokenPayload {
  id: string
  githubLogin: string
  avatarUrl: string
}

export function signUserToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
}

export function verifyUserToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload
  } catch {
    return null
  }
}
