/**
 * This utility is used to map repository names to their owners
 * We need this because we've removed the owner from the URL
 */

// Repository owner mapping
const REPO_OWNER_MAPPING: Record<string, string> = {
  'awesome-selfhosted': 'awesome-selfhosted',
  // Add more mappings as needed
};

/**
 * Get the owner for a repository name
 */
export function getOwnerForRepo(repoName: string): string {
  return REPO_OWNER_MAPPING[repoName] || '';
}

/**
 * Check if a repository is already known/mapped
 */
export function isKnownRepo(repoName: string): boolean {
  return repoName in REPO_OWNER_MAPPING;
} 