import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`환경변수 ${name}가 설정되어 있지 않습니다. server/.env를 확인하세요.`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me',
  databaseUrl: process.env.DATABASE_URL ?? '',
  github: {
    // 실제 GitHub OAuth 연동 구현 시점에 required()로 바꿔서 누락을 즉시 감지할 것.
    clientId: process.env.GITHUB_CLIENT_ID ?? '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
  },
  // Vercel Personal Access Token은 사용자별로 DB(VercelToken, 암호화 저장)에 보관한다.
  // 이 키는 그 토큰을 암호화/복호화하는 데 쓰이는 서버 공용 키다 (base64 인코딩된 32바이트).
  encryptionKey: process.env.ENCRYPTION_KEY ?? '',
}

export { required }
