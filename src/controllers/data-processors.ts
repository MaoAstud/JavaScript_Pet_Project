// Pure functions for data processing

import type { Repository } from "../types/repository"

/**
 * Filters repositories that have more than the specified number of stars
 */
export const filterRepositoriesByStars = (repositories: readonly Repository[], minStars = 5): Repository[] => {
  if (!Array.isArray(repositories)) {
    return []
  }

  return repositories.filter(
    (repo): repo is Repository => repo && typeof repo.stargazers_count === "number" && repo.stargazers_count > minStars,
  )
}

/**
 * Sorts repositories by updated date (most recent first) and returns the specified number
 */
export const getRecentlyUpdatedRepositories = (repositories: readonly Repository[], limit = 5): Repository[] => {
  if (!Array.isArray(repositories)) {
    return []
  }

  return repositories
    .filter((repo): repo is Repository => repo && Boolean(repo.updated_at))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit)
}

/**
 * Calculates the total number of stars across all repositories
 */
export const calculateTotalStars = (repositories: readonly Repository[]): number => {
  if (!Array.isArray(repositories)) {
    return 0
  }

  return repositories.reduce((total, repo) => {
    const stars = repo && typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0
    return total + stars
  }, 0)
}

/**
 * Formats a date string to a human-readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "Unknown"

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  } catch (error) {
    return "Unknown"
  }
}

/**
 * Validates repository data structure
 */
export const isValidRepository = (repo: any): repo is Repository => {
  return (
    repo &&
    typeof repo.id === "number" &&
    typeof repo.name === "string" &&
    typeof repo.html_url === "string" &&
    typeof repo.stargazers_count === "number" &&
    typeof repo.updated_at === "string"
  )
}

/**
 * Sanitizes repository data
 */
export const sanitizeRepositories = (repositories: any[]): Repository[] => {
  if (!Array.isArray(repositories)) {
    return []
  }

  return repositories.filter(isValidRepository)
}
