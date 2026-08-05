import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '../api/dashboard'

// GitHub 저장소 × Vercel 프로젝트 매칭 결과(백엔드에서 5분간 캐싱됨)를 가져온다.
// Vercel이 아직 연동되지 않은 경우 서버가 404를 반환하므로 재시도하지 않는다.
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    retry: false,
  })
}
