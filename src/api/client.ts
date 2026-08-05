import axios from 'axios'
import toast from 'react-hot-toast'

// 개발 환경에서는 vite.config.ts의 proxy 설정으로 /api가 로컬 백엔드(4000번 포트)로 전달된다.
// 배포 환경에서는 VITE_API_BASE_URL로 실제 백엔드 주소를 지정한다.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

// 어떤 API 호출이든 429(rate limit)를 맞으면 공통으로 안내 토스트를 띄운다.
// 각 화면에서 별도로 더 자세한 안내(배너 등)를 추가로 보여줘도 상관없다.
let lastRateLimitToastAt = 0
const RATE_LIMIT_TOAST_COOLDOWN_MS = 5000

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      const now = Date.now()
      if (now - lastRateLimitToastAt > RATE_LIMIT_TOAST_COOLDOWN_MS) {
        lastRateLimitToastAt = now
        const provider = (error.response.data as { provider?: string })?.provider
        const label = provider === 'github' ? 'GitHub' : provider === 'vercel' ? 'Vercel' : 'API'
        toast.error(`${label} 요청이 너무 많아 잠시 제한되었습니다. 잠시 후 다시 시도해주세요.`)
      }
    }
    return Promise.reject(error)
  },
)
