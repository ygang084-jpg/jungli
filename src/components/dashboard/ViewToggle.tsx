export type ViewMode = 'card' | 'table'

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5">
      {(
        [
          { mode: 'card', label: '카드' },
          { mode: 'table', label: '테이블' },
        ] as const
      ).map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            value === mode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
