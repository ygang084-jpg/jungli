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
