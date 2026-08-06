import type { VercelProject } from '../types/vercel'
import { apiClient } from './client'

export async function connectVercel(token: string): Promise<{ connected: true }> {
  const { data } = await apiClient.post<{ connected: true }>('/vercel/connect', { token })
  return data
}

interface VercelProjectsApiResponse {
  data: VercelProject[]
  stale: boolean
  cachedAt: string
}

export async function fetchVercelProjects(): Promise<VercelProjectsApiResponse> {
  const { data } = await apiClient.get<VercelProjectsApiResponse>('/vercel/projects')
  return data
}
