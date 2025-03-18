#!/usr/bin/env node
/**
 * Standalone scraper script for Awesome Hub
 * 
 * This script handles the scraping, processing, and storing of GitHub awesome lists
 * and is intended to be run independently of the frontend, either on a schedule
 * via cron or as a background worker process.
 */

import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import type { AwesomeList, TrackedRepository, ListItem } from '../src/types';
import { parseMarkdown, compareListVersions } from '../src/utils/markdown';

// Configuration
const DATA_DIR = path.join(process.cwd(), 'data', 'lists');
const TRACKED_REPOS_FILE = path.join(DATA_DIR, 'tracked-repos.json');

// Default tracked repositories
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
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`Creating data directory: ${DATA_DIR}`);
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize with default repositories
    await fsPromises.writeFile(
      TRACKED_REPOS_FILE, 
      JSON.stringify(DEFAULT_TRACKED_REPOS, null, 2)
    );
    console.log('Initialized tracked repositories file');
  }
}

/**
 * Get tracked repositories from JSON file
 */
async function getTrackedRepositories(): Promise<TrackedRepository[]> {
  try {
    await ensureDataDir();
    
    if (!fs.existsSync(TRACKED_REPOS_FILE)) {
      await fsPromises.writeFile(
        TRACKED_REPOS_FILE, 
        JSON.stringify(DEFAULT_TRACKED_REPOS, null, 2)
      );
      return DEFAULT_TRACKED_REPOS;
    }
    
    const data = await fsPromises.readFile(TRACKED_REPOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tracked repositories:', error);
    return DEFAULT_TRACKED_REPOS;
  }
}

/**
 * Get repository info from GitHub
 */
async function getRepositoryInfo(owner: string, repo: string): Promise<any> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch repository info: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Check if repository has been updated since the last check
 */
async function hasRepoBeenUpdated(owner: string, repo: string, lastChecked: string): Promise<boolean> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch latest commit: ${response.statusText}`);
    }
    
    const commits = await response.json();
    
    if (commits.length === 0) {
      return false;
    }
    
    const latestCommitDate = new Date(commits[0].commit.committer.date);
    const lastCheckedDate = new Date(lastChecked);
    
    return latestCommitDate > lastCheckedDate;
  } catch (error) {
    console.error(`Error checking if repo has been updated: ${error}`);
    // If we can't determine, assume it needs updating to be safe
    return true;
  }
}

/**
 * Get README content from GitHub
 */
async function getReadmeContent(owner: string, repo: string, branch: string = 'main'): Promise<string> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }
  
  return response.text();
}

/**
 * Get the appropriate processor for a repository
 * Now always returns the universal parser
 */
function getListProcessor(owner: string, repo: string): (markdown: string, owner: string, repo: string, repoConfig?: TrackedRepository) => AwesomeList {
  // Always use the universal parser
  return parseMarkdown;
}

/**
 * Save list data to JSON file
 */
async function saveList(list: AwesomeList): Promise<void> {
  const filePath = path.join(DATA_DIR, `${list.owner}-${list.repo}.json`);
  await fsPromises.writeFile(filePath, JSON.stringify(list, null, 2));
  console.log(`Saved list data to ${filePath}`);
}

/**
 * Update the last checked timestamp for a repository
 */
async function updateLastChecked(owner: string, repo: string): Promise<void> {
  const repos = await getTrackedRepositories();
  const updated = repos.map(r => {
    if (r.owner === owner && r.repo === repo) {
      return {
        ...r,
        lastChecked: new Date().toISOString()
      };
    }
    return r;
  });
  
  await fsPromises.writeFile(TRACKED_REPOS_FILE, JSON.stringify(updated, null, 2));
}

/**
 * Get stored list data
 */
async function getStoredList(owner: string, repo: string): Promise<AwesomeList | null> {
  const filePath = path.join(DATA_DIR, `${owner}-${repo}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const data = await fsPromises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading list data: ${error}`);
    return null;
  }
}

/**
 * Process and update a single awesome list
 */
async function processAwesomeList(repo: TrackedRepository): Promise<boolean> {
  const { owner, repo: repoName, branch } = repo;
  
  try {
    console.log(`Processing list: ${owner}/${repoName}`);
    
    // Get repository info
    const repoInfo = await getRepositoryInfo(owner, repoName);
    
    // Determine which branch to use
    const targetBranch = branch || repoInfo.default_branch;
    
    // Fetch README content
    const readmeContent = await getReadmeContent(owner, repoName, targetBranch);
    
    // Get the appropriate processor for this list
    const processor = getListProcessor(owner, repoName);
    
    // Process the markdown content
    const currentList = processor(readmeContent, owner, repoName, repo);
    
    // Get previous version if available
    const previousList = await getStoredList(owner, repoName);
    
    // Compare with previous version (handles new vs. existing items)
    const updatedList = compareListVersions(previousList, currentList);
    
    // Save the updated list
    await saveList(updatedList);
    
    // Update last checked timestamp
    await updateLastChecked(owner, repoName);
    
    console.log(`Successfully processed list: ${owner}/${repoName}`);
    return true;
  } catch (error) {
    console.error(`Error processing list ${owner}/${repoName}:`, error);
    return false;
  }
}

/**
 * Main function to check and update all tracked repositories
 */
async function updateAllLists(): Promise<void> {
  try {
    // Ensure data directory exists
    await ensureDataDir();
    
    // Get all tracked repositories
    const repos = await getTrackedRepositories();
    console.log(`Found ${repos.length} tracked repositories`);
    
    // Process each repository
    for (const repo of repos) {
      try {
        console.log(`Checking for updates to ${repo.owner}/${repo.repo}`);
        const needsUpdate = await hasRepoBeenUpdated(
          repo.owner, 
          repo.repo, 
          repo.lastChecked
        );
        
        if (needsUpdate) {
          console.log(`${repo.owner}/${repo.repo} has updates, processing...`);
          await processAwesomeList(repo);
        } else {
          console.log(`No updates needed for ${repo.owner}/${repo.repo}`);
        }
      } catch (error) {
        console.error(`Error processing ${repo.owner}/${repo.repo}:`, error);
      }
    }
    
    console.log('Finished updating all lists');
  } catch (error) {
    console.error('Error updating lists:', error);
  }
}

// Main execution
console.log('Starting Awesome Hub scraper...');
updateAllLists()
  .then(() => {
    console.log('Scraper completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Scraper failed:', error);
    process.exit(1);
  }); 