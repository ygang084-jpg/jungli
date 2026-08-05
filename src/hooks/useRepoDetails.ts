import { useQuery } from '@tanstack/react-query'
import { fetchRepoDetails } from '../api/repoDetails'

export function useRepoDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['repoDetails', id],
    queryFn: () => fetchRepoDetails(id as string),
    enabled: Boolean(id),
  })
}
