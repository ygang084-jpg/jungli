import type { MatchedRepo } from '../../types/dashboard'
import { MatchedRepoCard } from './MatchedRepoCard'

export function MatchedRepoGrid({ items }: { items: MatchedRepo[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <MatchedRepoCard key={item.repo.id} item={item} />
      ))}
    </section>
  )
}
