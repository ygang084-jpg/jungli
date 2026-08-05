const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

interface RetryOptions {
  retries?: number
  baseDelayMs?: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// fetch를 지수 백오프로 감싼다: 네트워크 오류나 429/5xx 응답이면 최대 retries회(기본 3회)까지
// baseDelayMs * 2^attempt 간격으로 재시도한다. 마지막 시도까지 실패하면 마지막 Response(또는 마지막 네트워크 에러)를 그대로 반환/전파한다.
export async function fetchWithRetry(
  input: string | URL,
  init?: RequestInit,
  { retries = 3, baseDelayMs = 500 }: RetryOptions = {},
): Promise<Response> {
  let lastResponse: Response | undefined
  let lastError: unknown

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(input, init)
      if (response.ok || !RETRYABLE_STATUS.has(response.status)) {
        return response
      }
      lastResponse = response
    } catch (err) {
      lastError = err
    }

    if (attempt < retries - 1) {
      await sleep(baseDelayMs * 2 ** attempt)
    }
  }

  if (lastResponse) return lastResponse
  throw lastError
}
