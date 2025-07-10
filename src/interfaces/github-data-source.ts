import type { Repository } from "../types/repository"

export interface IGitHubDataSource {

  fetchRepositories(organization: string): Promise<Repository[]>

}
