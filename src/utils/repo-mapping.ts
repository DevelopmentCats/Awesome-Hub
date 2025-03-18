/**
 * This utility is used to map repository names to their owners
 * We need this because we've removed the owner from the URL
 */

// Direct import of the trackedRepos JSON 
// This will be bundled at build time and doesn't require fs
import trackedReposData from '@/../data/lists/tracked-repos.json';

// Build the mapping at startup
const repoOwnerMapping: Record<string, string> = {
  // Default fallback
  'awesome-selfhosted': 'awesome-selfhosted'
};

// Process the imported JSON data
try {
  if (Array.isArray(trackedReposData)) {
    trackedReposData.forEach((repo: any) => {
      if (repo.repo && repo.owner) {
        repoOwnerMapping[repo.repo] = repo.owner;
      }
    });
  }
} catch (error) {
  console.error('Error processing repo mapping:', error);
}

/**
 * Get the owner for a repository name
 */
export function getOwnerForRepo(repoName: string): string {
  return repoOwnerMapping[repoName] || '';
}

/**
 * Check if a repository is already known/mapped
 */
export function isKnownRepo(repoName: string): boolean {
  return repoName in repoOwnerMapping;
} 