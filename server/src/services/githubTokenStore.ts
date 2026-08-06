// GitHub access token은 절대 클라이언트로 내려보내지 않고, Vercel 토큰과 동일하게
// AES-256-GCM으로 암호화해 DB(users.encrypted_github_token)에 저장한다.
import { prisma } from '../lib/prisma'
import { encrypt, decrypt } from '../utils/crypto'

export async function setGithubAccessToken(
  githubId: string,
  githubLogin: string,
  avatarUrl: string,
  accessToken: string,
): Promise<void> {
  const encryptedGithubToken = encrypt(accessToken)
  await prisma.user.upsert({
    where: { githubId },
    update: { githubLogin, avatarUrl, encryptedGithubToken },
    create: { githubId, githubLogin, avatarUrl, encryptedGithubToken },
  })
}

export async function getGithubAccessToken(githubId: string): Promise<string | undefined> {
  const user = await prisma.user.findUnique({ where: { githubId } })
  if (!user?.encryptedGithubToken) {
    return undefined
  }
  return decrypt(user.encryptedGithubToken)
}

export async function deleteGithubAccessToken(githubId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { githubId },
    data: { encryptedGithubToken: null },
  })
}
