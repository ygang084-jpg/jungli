export interface VercelLinkedRepo {
  type: string | null
  repo: string | null
  org: string | null
}

export interface VercelProject {
  id: string
  name: string
  productionUrl: string | null
  linkedRepo: VercelLinkedRepo | null
}
