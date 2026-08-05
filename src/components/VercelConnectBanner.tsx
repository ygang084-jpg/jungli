import { Link } from 'react-router-dom'

export function VercelConnectBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p>Vercel을 연동하면 저장소별 배포 상태와 URL을 함께 볼 수 있어요.</p>
      <Link
        to="/settings"
        className="rounded-md border border-amber-300 bg-white px-3 py-1.5 font-medium hover:bg-amber-100"
      >
        Vercel 연동하기
      </Link>
    </div>
  )
}
