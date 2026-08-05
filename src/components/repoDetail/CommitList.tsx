import type { CommitSummary } from '../../types/repoDetails'
import { formatDateTime } from '../../utils/formatDate'

export function CommitList({ commits }: { commits: CommitSummary[] }) {
  if (commits.length === 0) {
    return <p className="text-sm text-gray-500">커밋 내역이 없습니다.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {commits.map((commit) => (
        <li key={commit.sha} className="rounded-md border border-gray-200 bg-white p-3">
          <a
            href={commit.url}
            target="_blank"
            rel="noreferrer"
            className="line-clamp-2 text-sm font-medium text-gray-900 hover:underline"
          >
            {commit.message.split('\n')[0]}
          </a>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{commit.author ?? '알 수 없음'}</span>
            <span aria-hidden>·</span>
            <span>{formatDateTime(commit.date)}</span>
            <span aria-hidden>·</span>
            <span className="font-mono">{commit.sha.slice(0, 7)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
