import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCurrentUser, logout as logoutRequest } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    retry: false,
  })

  useEffect(() => {
    if (query.data !== undefined) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  return {
    user,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(user),
  }
}

export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return async () => {
    await logoutRequest()
    setUser(null)
    queryClient.setQueryData(['currentUser'], null)
    navigate('/login', { replace: true })
  }
}
