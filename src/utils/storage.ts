'use client';

import { AwesomeList, TrackedRepository, ListItem } from '@/types';

// Default list of awesome repositories to track
const DEFAULT_TRACKED_REPOS: TrackedRepository[] = [
  {
    owner: 'awesome-selfhosted',
    repo: 'awesome-selfhosted',
    name: 'Awesome Selfhosted',
    description: 'A list of Free Software network services and web applications which can be hosted on your own servers',
    lastChecked: new Date().toISOString(),
    branch: 'master'
  }
];

/**
 * Save data to localStorage
 */
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * Get data from localStorage
 */
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch (error) {
        console.error(`Error parsing stored data for key ${key}:`, error);
      }
    }
  }
  return defaultValue;
}

/**
 * Get list of tracked repositories
 */
export function getTrackedRepositories(): TrackedRepository[] {
  return getFromStorage<TrackedRepository[]>('awesome-hub-tracked-repos', DEFAULT_TRACKED_REPOS);
}

/**
 * Save list of tracked repositories
 */
export function saveTrackedRepositories(repos: TrackedRepository[]): void {
  saveToStorage('awesome-hub-tracked-repos', repos);
}

/**
 * Add a repository to track
 */
export function addTrackedRepository(repo: TrackedRepository): void {
  const repos = getTrackedRepositories();
  
  // Check if repo already exists
  const exists = repos.some(r => r.owner === repo.owner && r.repo === repo.repo);
  
  if (!exists) {
    repos.push(repo);
    saveTrackedRepositories(repos);
  }
}

/**
 * Remove a tracked repository
 */
export function removeTrackedRepository(owner: string, repo: string): void {
  const repos = getTrackedRepositories();
  const filtered = repos.filter(r => !(r.owner === owner && r.repo === repo));
  saveTrackedRepositories(filtered);
}

/**
 * Update last checked timestamp for a repository
 */
export function updateLastChecked(owner: string, repo: string): void {
  const repos = getTrackedRepositories();
  const updated = repos.map(r => {
    if (r.owner === owner && r.repo === repo) {
      return {
        ...r,
        lastChecked: new Date().toISOString()
      };
    }
    return r;
  });
  
  saveTrackedRepositories(updated);
}

/**
 * Get stored list data
 */
export function getStoredList(owner: string, repo: string): AwesomeList | null {
  const key = `awesome-hub-list-${owner}-${repo}`;
  return getFromStorage<AwesomeList | null>(key, null);
}

/**
 * Save list data
 */
export function saveStoredList(list: AwesomeList): void {
  const key = `awesome-hub-list-${list.owner}-${list.repo}`;
  saveToStorage(key, list);
}

/**
 * Get all new items across all lists
 */
export function getAllNewItems(daysToConsiderNew = 7): ListItem[] {
  const repos = getTrackedRepositories();
  const allNewItems: ListItem[] = [];
  
  const nowTime = new Date().getTime();
  const newThreshold = daysToConsiderNew * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  repos.forEach(repo => {
    const list = getStoredList(repo.owner, repo.repo);
    if (list) {
      // Add a listName property to each item for display purposes
      const newItems = list.items
        .filter(item => {
          const firstSeenTime = new Date(item.firstSeen).getTime();
          return (nowTime - firstSeenTime) < newThreshold;
        })
        .map(item => ({
          ...item,
          listId: list.id,
          listName: list.name
        }));
      
      allNewItems.push(...newItems);
    }
  });
  
  // Sort by firstSeen date, newest first
  return allNewItems.sort((a, b) => 
    new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime()
  );
} 