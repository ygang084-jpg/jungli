import { prisma } from '../lib/prisma'

export async function getHiddenRepoIds(githubId: string): Promise<number[]> {
  const user = await prisma.user.findUnique({ where: { githubId } })
  return user?.hiddenRepoIds ?? []
}

export async function hideRepo(githubId: string, repoId: number): Promise<void> {
  const current = await getHiddenRepoIds(githubId)
  if (current.includes(repoId)) return
  await prisma.user.update({
    where: { githubId },
    data: { hiddenRepoIds: [...current, repoId] },
  })
}

export async function unhideRepo(githubId: string, repoId: number): Promise<void> {
  const current = await getHiddenRepoIds(githubId)
  await prisma.user.update({
    where: { githubId },
    data: { hiddenRepoIds: current.filter((id) => id !== repoId) },
  })
}
