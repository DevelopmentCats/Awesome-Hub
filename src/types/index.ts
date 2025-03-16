// List item represents a single entry in an awesome list
export interface ListItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  subcategory?: string;
  firstSeen: string;
  isNew: boolean;
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
}

// AwesomeList represents a parsed GitHub awesome list
export interface AwesomeList {
  id: string;
  name: string;
  description: string;
  owner: string;
  repo: string;
  items: ListItem[];
  categories: string[];
  subcategories: Record<string, string[]>;
  lastUpdated: string;
}

// GitHub API related types
export interface GitHubRepo {
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

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    }
  }
}

// Storage models
export interface TrackedRepository {
  owner: string;
  repo: string;
  name: string;
  description: string;
  lastChecked: string;
  branch: string;
}

// Recently viewed items tracking
export interface RecentlyViewedItem {
  id: string;
  title: string;
  listId: string;
  listName: string;
  timestamp: string;
} 