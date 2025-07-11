export interface Repository {
  readonly id: number
  readonly name: string
  readonly full_name: string
  readonly html_url: string
  readonly description: string | null
  readonly stargazers_count: number
  readonly language: string | null
  readonly updated_at: string
  readonly created_at: string
  readonly fork: boolean
  readonly archived: boolean
  readonly disabled: boolean
}

export interface GitHubApiError {
  readonly message: string
  readonly status?: number
  readonly type: "network" | "api" | "validation" | "unknown"
}

export type LanguageColor = string

export interface LanguageColorMap {
  readonly [language: string]: LanguageColor
}