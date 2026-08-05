import { StaleCache } from '../utils/staleCache'
import type { DashboardResponse } from '../types/dashboard'
import type { GithubRepo } from './github'
import type { VercelProject } from './vercel'

const FIVE_MINUTES = 5 * 60 * 1000

// GitHub/Vercel API를 매 요청마다 다시 훑지 않도록 사용자별로 캐싱하고,
// API 장애 시에는 만료된 값이라도 폴백으로 내려줄 수 있게 StaleCache를 쓴다.
export const dashboardCache = new StaleCache<DashboardResponse>(FIVE_MINUTES)
export const reposCache = new StaleCache<GithubRepo[]>(FIVE_MINUTES)
export const vercelProjectsCache = new StaleCache<VercelProject[]>(FIVE_MINUTES)
