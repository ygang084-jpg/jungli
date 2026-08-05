import { useState } from 'react'
import toast from 'react-hot-toast'
import { useLogout } from '../hooks/useAuth'
import { useConnectVercel } from '../hooks/useVercel'

export function Settings() {
  const logout = useLogout()
  const connectVercel = useConnectVercel()
  const [token, setToken] = useState('')

  const handleConnect = () => {
    if (!token.trim()) return

    connectVercel.mutate(token.trim(), {
      onSuccess: () => {
        toast.success('Vercel 연동에 성공했습니다.')
        setToken('')
      },
      onError: (error) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Vercel 연동에 실패했습니다. 토큰을 확인해주세요.'
        toast.error(message)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">설정</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700">Vercel 연동</h2>
        <p className="text-sm text-gray-500">
          Vercel Personal Access Token을 입력하면 배포 상태를 대시보드에서 확인할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Vercel Personal Access Token"
            className="min-w-64 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleConnect}
            disabled={connectVercel.isPending || !token.trim()}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {connectVercel.isPending ? '연동 중...' : 'Vercel 연동하기'}
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700">연동 관리</h2>
        <button className="w-fit rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
          GitHub 연결 해제
        </button>
        <button className="w-fit rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
          Vercel 연결 해제
        </button>
      </section>

      <button
        onClick={logout}
        className="w-fit rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700"
      >
        로그아웃
      </button>
    </div>
  )
}
