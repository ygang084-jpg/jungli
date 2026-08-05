import { fetchWithRetry } from '../utils/fetchWithRetry'
import { ExternalApiError, RateLimitError } from '../utils/errors'

const GITHUB_API_BASE = 'https://api.github.com'
const PER_PAGE = 100
const MAX_PAGES = 50 // 안전장치: 저장소 5,000개 이상은 없다고 가정

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  default_branch: string
  updated_at: string
  language: string | null
  html_url: string
}

export interface CommitSummary {
  sha: string
  message: string
  author: string | null
  date: string | null
  url: string
}

function githubHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'gh-vercel-dashboard',
  }
}

function trimRepo(repo: GithubRepo): GithubRepo {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    default_branch: repo.default_branch,
    updated_at: repo.updated_at,
    language: repo.language,
    html_url: repo.html_url,
  }
}

// 응답이 실패(!ok)면 429는 RateLimitError, 그 외는 ExternalApiError로 통일해서 던진다.
function assertOk(response: Response): void {
  if (response.ok) return
  if (response.status === 429) throw new RateLimitError('github')
  throw new ExternalApiError(
    `GitHub API 요청이 실패했습니다 (status: ${response.status})`,
    response.status,
    'github',
  )
}

// GET /user/repos를 페이지당 100개씩 끝까지 순회해 필요한 필드만 추려서 반환한다.
// 각 페이지 요청은 지수 백오프로 최대 3회 재시도하며, 재시도 끝에도 실패하면 던진다(호출부에서 캐시 폴백 처리).
export async function fetchAllGithubRepos(accessToken: string): Promise<GithubRepo[]> {
  const repos: GithubRepo[] = []

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await fetchWithRetry(
      `${GITHUB_API_BASE}/user/repos?per_page=${PER_PAGE}&page=${page}`,
      { headers: githubHeaders(accessToken) },
    )
    assertOk(response)

    const pageData = (await response.json()) as GithubRepo[]
    repos.push(...pageData.map(trimRepo))

    if (pageData.length < PER_PAGE) break
  }

  return repos
}

// GET /repositories/{id} → 저장소 numeric id로 단건 조회 (없으면 null)
export async function fetchGithubRepoById(
  accessToken: string,
  repoId: string,
): Promise<GithubRepo | null> {
  const response = await fetchWithRetry(`${GITHUB_API_BASE}/repositories/${repoId}`, {
    headers: githubHeaders(accessToken),
  })

  if (response.status === 404) return null
  assertOk(response)

  return trimRepo((await response.json()) as GithubRepo)
}

// GET /repos/{full_name}/commits → 최근 커밋 N개.
// 커밋 목록은 보조 정보라서, 재시도 끝에도 실패하면(빈 저장소·rate limit 등) 전체 요청을 막지 않고 빈 배열로 낮춘다.
export async function fetchRecentCommits(
  accessToken: string,
  fullName: string,
  count: number,
): Promise<CommitSummary[]> {
  let response: Response
  try {
    response = await fetchWithRetry(`${GITHUB_API_BASE}/repos/${fullName}/commits?per_page=${count}`, {
      headers: githubHeaders(accessToken),
    })
  } catch (err) {
    console.error(`GitHub 커밋 조회 실패 (${fullName}):`, err)
    return []
  }

  if (!response.ok) return []

  const data = (await response.json()) as Array<{
    sha: string
    html_url: string
    commit: { message: string; author?: { name?: string; date?: string } }
    author?: { login?: string }
  }>

  return data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author?.name ?? commit.author?.login ?? null,
    date: commit.commit.author?.date ?? null,
    url: commit.html_url,
  }))
}
