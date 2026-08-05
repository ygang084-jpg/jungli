export interface User {
  id: string
  githubId: string
  githubLogin: string
  avatarUrl: string
}

export type DeploymentStatus = 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
