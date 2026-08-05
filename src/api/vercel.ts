import type { VercelProject } from '../types/vercel'
import { apiClient } from './client'

export async function connectVercel(token: string): Promise<{ connected: true }> {
  const { data } = await apiClient.post<{ connected: true }>('/vercel/connect', { token })
  return data
}

export async function fetchVercelProjects(): Promise<VercelProject[]> {
  const { data } = await apiClient.get<VercelProject[]>('/vercel/projects')
  return data
}
