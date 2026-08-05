export interface StaleCacheEntry<T> {
  data: T
  cachedAt: number
}

// 정상 응답을 TTL 동안 재사용하고, 외부 API 장애 시에는 만료된 값이라도 "마지막으로 성공한 데이터"로 돌려줄 수 있게
// getFresh(TTL 이내만)와 getStale(만료 여부 무관, 값이 있으면 항상)을 구분해서 제공한다.
export class StaleCache<T> {
  private store = new Map<string, StaleCacheEntry<T>>()

  constructor(private ttlMs: number) {}

  getFresh(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() - entry.cachedAt > this.ttlMs) return null
    return entry.data
  }

  getStale(key: string): StaleCacheEntry<T> | null {
    return this.store.get(key) ?? null
  }

  set(key: string, data: T): void {
    this.store.set(key, { data, cachedAt: Date.now() })
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }
}
