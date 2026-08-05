import type { User } from '../types'
import { apiClient } from './client'

// 실제 GitHub OAuth 플로우는 서버가 처리한다. 프론트는 이 경로로 리다이렉트만 시킨다.
export function redirectToGithubLogin() {
  window.location.href = `${apiClient.defaults.baseURL}/auth/github`
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function fetchCurrentUser(): Promise<User | null> {
  const { data } = await apiClient.get<User | null>('/auth/me')
  return data
}
