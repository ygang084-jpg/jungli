import { formatDateTime } from '../../utils/formatDate'

export function StaleDataBanner({ cachedAt }: { cachedAt: string }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      ⚠️ 최신 정보가 아닙니다. GitHub/Vercel API 응답이 원활하지 않아 {formatDateTime(cachedAt)} 기준 캐시된
      데이터를 보여주고 있어요.
    </div>
  )
}
