import { prisma } from '../lib/prisma'

export async function getUserWithVercelToken(githubId: string) {
  return prisma.user.findUnique({
    where: { githubId },
    include: { vercelToken: true },
  })
}
