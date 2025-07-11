import {
  filterRepositoriesByStars,
  getRecentlyUpdatedRepositories,
  calculateTotalStars,
  formatDate,
  getLanguageColor
} from "./controllers/data-processors.js"
import { GitHubApiService } from "./services/github-api-service.js"
import type { IGitHubDataSource } from "./interfaces/github-data-source.js"
import type { Repository } from "./types/repository.js"

// DOM elements
const loadingElement = document.getElementById("loading") as HTMLElement
const errorElement = document.getElementById("error") as HTMLElement
const contentElement = document.getElementById("content") as HTMLElement
const totalStarsElement = document.getElementById("total-stars") as HTMLElement
const popularReposElement = document.getElementById("popular-repos") as HTMLElement
const recentReposElement = document.getElementById("recent-repos") as HTMLElement

// Application state
let repositories: Repository[] = []
let dataSource: IGitHubDataSource = new GitHubApiService();

/**
 * Creates HTML for a repository card
 */
const createRepositoryCard = (repo: Repository): string => {
  const languageColor = getLanguageColor(repo.language)
  const updatedDate = formatDate(repo.updated_at)

  return `
    <div class="repo-card">
      <div class="repo-header">
        <a href="${repo.html_url}" target="_blank" class="repo-name">
          ${repo.name}
        </a>
        <div class="repo-stars">
          ⭐ ${repo.stargazers_count}
        </div>
      </div>
      <div class="repo-description">
        ${repo.description || "No description available"}
      </div>
      <div class="repo-meta">
        <div class="repo-language">
          <div class="language-dot" style="background-color: ${languageColor}"></div>
          ${repo.language || "Unknown"}
        </div>
        <div class="repo-updated">
          Updated ${updatedDate}
        </div>
      </div>
    </div>
  `
}

/**
 * Renders repositories in the specified container
 */
const renderRepositories = (repos: Repository[], container: HTMLElement): void => {
  if (!repos || repos.length === 0) {
    container.innerHTML = "<p>No repositories found.</p>"
    return
  }

  container.innerHTML = repos.map(createRepositoryCard).join("")
}

/**
 * Updates the UI with repository data
 */
const updateUI = (repos: Repository[]): void => {
  repositories = repos

  // Calculate and display total stars
  const totalStars = calculateTotalStars(repos)
  totalStarsElement.textContent = totalStars.toLocaleString()

  // Filter and display popular repositories
  const popularRepos = filterRepositoriesByStars(repos, 5)
  renderRepositories(popularRepos, popularReposElement)

  // Get and display recently updated repositories
  const recentRepos = getRecentlyUpdatedRepositories(repos, 5)
  renderRepositories(recentRepos, recentReposElement)

  // Show content and hide loading
  loadingElement.style.display = "none"
  errorElement.style.display = "none"
  contentElement.style.display = "block"
}

/**
 * Shows error state
 */
const showError = (message: string): void => {
  console.error("Application error:", message)

  loadingElement.style.display = "none"
  contentElement.style.display = "none"
  errorElement.style.display = "block"

  const errorText = errorElement.querySelector("p") as HTMLParagraphElement
  errorText.textContent = message || "An unexpected error occurred."
}

/**
 * Shows loading state
 */
const showLoading = (): void => {
  loadingElement.style.display = "block"
  errorElement.style.display = "none"
  contentElement.style.display = "none"
}

/**
 * Loads repositories from the configured data source
 */
const loadRepositories = async (): Promise<void> => {
  showLoading()

  try {
    const repos = await dataSource.fetchRepositories("stackbuilders")
    updateUI(repos)
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    showError(message)
  }
}

// Make loadRepositories available globally for the retry button
declare global {
  interface Window {
    loadRepositories: () => Promise<void>
  }
}

window.loadRepositories = loadRepositories

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadRepositories()
})
