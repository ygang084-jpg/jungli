export type StatusFilter = 'ALL' | 'READY' | 'ERROR' | 'BUILDING'

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'READY', label: 'Ready' },
  { value: 'ERROR', label: 'Error' },
  { value: 'BUILDING', label: 'Building' },
]

export function StatusFilterButtons({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter
  onChange: (filter: StatusFilter) => void
  counts: Record<StatusFilter, number>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            value === option.value
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {option.label}
          <span className="ml-1.5 text-xs opacity-70">{counts[option.value]}</span>
        </button>
      ))}
    </div>
  )
}
