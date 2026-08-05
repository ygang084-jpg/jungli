import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            GitHub-Vercel 대시보드
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/dashboard" className="hover:underline">
              대시보드
            </Link>
            <Link to="/settings" className="hover:underline">
              설정
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
