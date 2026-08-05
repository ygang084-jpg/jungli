import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { connectVercel, fetchVercelProjects } from '../api/vercel'

export function useVercelProjects() {
  return useQuery({
    queryKey: ['vercelProjects'],
    queryFn: fetchVercelProjects,
    retry: false, // 404(연동 안 됨)를 재시도할 필요는 없다
  })
}

export function useConnectVercel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: connectVercel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vercelProjects'] })
    },
  })
}
