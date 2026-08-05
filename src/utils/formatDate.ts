export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '정보 없음'
  return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
}
