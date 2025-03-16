import axios from 'axios';

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    }
  }
}

/**
 * Get repository information from GitHub API
 */
export async function getRepositoryInfo(owner: string, repo: string): Promise<GitHubRepo> {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching repository info:', error);
    throw new Error('Failed to fetch repository information');
  }
}

/**
 * Get the latest commit information for a repository
 */
export async function getLatestCommit(owner: string, repo: string, path = ''): Promise<GitHubCommit> {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      params: {
        path,
        per_page: 1
      }
    });
    return response.data[0];
  } catch (error) {
    console.error('Error fetching latest commit:', error);
    throw new Error('Failed to fetch latest commit information');
  }
}

/**
 * Check if a repository has been updated since a given timestamp
 */
export async function hasRepoBeenUpdated(owner: string, repo: string, lastChecked: string): Promise<boolean> {
  try {
    const latestCommit = await getLatestCommit(owner, repo);
    const latestCommitDate = new Date(latestCommit.commit.author.date);
    const lastCheckedDate = new Date(lastChecked);
    
    return latestCommitDate > lastCheckedDate;
  } catch (error) {
    console.error('Error checking if repo has been updated:', error);
    return true; // Assume it has been updated if there's an error
  }
}

/**
 * Fetch README content from a repository
 */
export async function getReadmeContent(owner: string, repo: string, branch = 'main'): Promise<string> {
  try {
    // Try to fetch README.md
    try {
      const response = await axios.get(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`
      );
      return response.data;
    } catch (error) {
      // If README.md not found, try readme.md (lowercase)
      const response = await axios.get(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/readme.md`
      );
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching README content:', error);
    throw new Error('Failed to fetch README content');
  }
} 