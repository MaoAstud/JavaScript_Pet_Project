import type { IGitHubDataSource } from "../interfaces/github-data-source"
import type { Repository } from "../types/repository"
import { sanitizeRepositories } from "../controllers/data-processors"

export class GitHubApiService implements IGitHubDataSource {
    private readonly baseUrl: string = "https://api.github.com";

    fetchRepositories = async (organization: string): Promise<Repository[]>  => {
        if (!organization || typeof organization !== "string") {
            throw new Error("Organization name is required and must be a string");
        }

        const url = `${this.baseUrl}/orgs/${organization}/repos?per_page=100&sort=updated`;

        const headers = {
            "User-Agent": "MaoAstud",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        };

        try {
            const response = await fetch(url, { headers });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Organization '${organization}' not found`);
                }
                if (response.status === 403) {
                    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
                    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
                    const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'Unkown';

                    if (rateLimitRemaining === '0') {
                        throw new Error(`API rate limit exceeded. Please try again after ${resetTime}.`);
                    }
                    throw new Error("Forbidden: Check your token's permissions or API rate limit.");
                }
                if (response.status === 401) {
                    throw new Error("Unauthorized: Invalid or missing authentication token.");
                }
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const repositories: Repository[] = await response.json();
            return sanitizeRepositories(repositories);
        } catch (error) {
            if (error instanceof Error && error.name === "TypeError" && error.message.includes("fetch")) {
                throw new Error("Network error. Please check your internet connection.");
            }
            throw error;
        }
    };

    // TODO: GitHubErrorHandler

}
