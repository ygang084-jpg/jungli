export type ExternalProvider = 'github' | 'vercel'

// GitHub/Vercel 등 외부 API 호출이 재시도 끝에도 실패했을 때 던지는 에러.
export class ExternalApiError extends Error {
  status: number
  provider: ExternalProvider

  constructor(message: string, status: number, provider: ExternalProvider) {
    super(message)
    this.name = 'ExternalApiError'
    this.status = status
    this.provider = provider
  }
}

// 429(Too Many Requests) 전용 — 프론트에 "요청 제한 초과"를 명확히 알리기 위해 구분한다.
export class RateLimitError extends ExternalApiError {
  constructor(provider: ExternalProvider) {
    const label = provider === 'github' ? 'GitHub' : 'Vercel'
    super(`${label} API 요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.`, 429, provider)
    this.name = 'RateLimitError'
  }
}
