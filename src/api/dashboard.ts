import type { DashboardResponse } from '../types/dashboard'
import { apiClient } from './client'

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>('/dashboard')
  return data
}
