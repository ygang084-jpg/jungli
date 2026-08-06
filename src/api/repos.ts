import type { GithubRepo } from '../types/github'
import { apiClient } from './client'

export async function hideRepo(id: number): Promise<void> {
  await apiClient.post(`/repos/${id}/hide`)
}

export async function unhideRepo(id: number): Promise<void> {
  await apiClient.delete(`/repos/${id}/hide`)
}

export async function fetchHiddenRepos(): Promise<GithubRepo[]> {
  const { data } = await apiClient.get<{ data: GithubRepo[] }>('/repos/hidden')
  return data.data
}
