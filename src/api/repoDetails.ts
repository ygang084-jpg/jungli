import type { RepoDetailsResponse } from '../types/repoDetails'
import { apiClient } from './client'

export async function fetchRepoDetails(id: string): Promise<RepoDetailsResponse> {
  const { data } = await apiClient.get<RepoDetailsResponse>(`/repos/${id}/details`)
  return data
}
