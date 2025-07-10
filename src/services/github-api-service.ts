// GitHub API service implementing IGitHubDataSource

import type { IGitHubDataSource } from "../interfaces/github-data-source"
import type { Repository } from "../types/repository"
import { sanitizeRepositories } from "../controllers/data-processors"

export class GitHubApiService implements IGitHubDataSource {
  private readonly baseUrl: string = "https://api.github.com"

  async fetchRepositories(organization: string): Promise<Repository[]> {
    if (!organization || typeof organization !== "string") {
      throw Error("Organization name is required and must be a string")
    }

    const url = `${this.baseUrl}/orgs/${organization}/repos?per_page=100&sort=updated`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw Error("Error fetching github api")
      }

      const repositories: Repository[] = await response.json()
      return sanitizeRepositories(repositories)
    } catch (error) {
      if (error instanceof Error && error.name === "TypeError" && error.message.includes("fetch")) {
        throw Error("Network error. Please check your internet connection.")
      }
      throw error
    }
  }



}
