import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchHiddenRepos, hideRepo, unhideRepo } from '../api/repos'

export function useHiddenRepos() {
  return useQuery({
    queryKey: ['hiddenRepos'],
    queryFn: fetchHiddenRepos,
  })
}

function useInvalidateAfterVisibilityChange() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['hiddenRepos'] })
  }
}

export function useHideRepo() {
  const invalidate = useInvalidateAfterVisibilityChange()

  return useMutation({
    mutationFn: hideRepo,
    onSuccess: invalidate,
  })
}

export function useUnhideRepo() {
  const invalidate = useInvalidateAfterVisibilityChange()

  return useMutation({
    mutationFn: unhideRepo,
    onSuccess: invalidate,
  })
}
