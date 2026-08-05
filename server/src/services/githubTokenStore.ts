// GitHub access token은 절대 클라이언트로 내려보내지 않고 서버 메모리에만 보관한다.
// TODO: 서버 재시작 시 사라지므로, 실제 서비스에서는 prd-webapp.md의 User.github_access_token처럼
//       암호화해서 DB(PostgreSQL/Supabase)에 저장하고 사용자 id로 조회하도록 교체할 것.
const store = new Map<string, string>()

export function setGithubAccessToken(userId: string, accessToken: string): void {
  store.set(userId, accessToken)
}

export function getGithubAccessToken(userId: string): string | undefined {
  return store.get(userId)
}

export function deleteGithubAccessToken(userId: string): void {
  store.delete(userId)
}
