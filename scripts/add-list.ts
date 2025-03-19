#!/usr/bin/env node
/**
 * Script to add a new awesome list to the tracked repositories
 * 
 * Usage: npm run add-list <github-repo-url>
 * Example: npm run add-list https://github.com/sindresorhus/awesome
 */

import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import type { TrackedRepository } from '../src/types';

// Configuration
const DATA_DIR = path.join(process.cwd(), 'data', 'lists');
const TRACKED_REPOS_FILE = path.join(DATA_DIR, 'tracked-repos.json');

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`Creating data directory: ${DATA_DIR}`);
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Handle various GitHub URL formats
    const githubRegexes = [
      /github\.com\/([^\/]+)\/([^\/]+)\/?$/,             // https://github.com/owner/repo
      /github\.com\/([^\/]+)\/([^\/]+)\/tree\/[^\/]+\/?$/, // https://github.com/owner/repo/tree/branch
      /github\.com\/([^\/]+)\/([^\/]+)\/blob\/[^\/]+\/?$/, // https://github.com/owner/repo/blob/branch/path
    ];

    for (const regex of githubRegexes) {
      const match = url.match(regex);
      if (match) {
        return {
          owner: match[1],
          repo: match[2]
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
}

/**
 * Get repository info from GitHub API
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
 * Get tracked repositories from JSON file
 */
async function getTrackedRepositories(): Promise<TrackedRepository[]> {
  try {
    await ensureDataDir();
    
    if (!fs.existsSync(TRACKED_REPOS_FILE)) {
      return [];
    }
    
    const data = await fsPromises.readFile(TRACKED_REPOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tracked repositories:', error);
    return [];
  }
}

/**
 * Save tracked repositories to JSON file
 */
async function saveTrackedRepositories(repos: TrackedRepository[]): Promise<void> {
  await ensureDataDir();
  await fsPromises.writeFile(
    TRACKED_REPOS_FILE, 
    JSON.stringify(repos, null, 2)
  );
}

/**
 * Add a new repository to tracked repositories
 */
async function addRepository(githubUrl: string): Promise<void> {
  try {
    const parsed = parseGitHubUrl(githubUrl);
    
    if (!parsed) {
      console.error('Invalid GitHub URL format. Please provide a URL like https://github.com/owner/repo');
      process.exit(1);
    }
    
    const { owner, repo } = parsed;
    
    // Check if repository exists on GitHub
    console.log(`Fetching repository information for ${owner}/${repo}...`);
    const repoInfo = await getRepositoryInfo(owner, repo);
    
    // Check if this is an actual awesome list (contains "awesome" in name or description)
    const isAwesomeList = 
      repoInfo.name.toLowerCase().includes('awesome') || 
      (repoInfo.description && repoInfo.description.toLowerCase().includes('awesome'));
    
    if (!isAwesomeList) {
      console.warn(`Warning: The repository ${owner}/${repo} doesn't seem to be an awesome list.`);
      console.warn(`Repository name: ${repoInfo.name}`);
      console.warn(`Repository description: ${repoInfo.description || 'No description'}`);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise<string>(resolve => {
        readline.question('Do you want to continue anyway? (y/n): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
    }
    
    // Get existing tracked repositories
    const trackedRepos = await getTrackedRepositories();
    
    // Check if repository is already tracked
    const isAlreadyTracked = trackedRepos.some(
      r => r.owner === owner && r.repo === repo
    );
    
    if (isAlreadyTracked) {
      console.log(`Repository ${owner}/${repo} is already being tracked.`);
      process.exit(0);
    }
    
    // Get 20 years ago date
    const twentyYearsAgo = new Date();
    twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
    
    // Create new tracked repository with old date
    const newRepo: TrackedRepository = {
      owner,
      repo,
      name: repoInfo.name,
      description: repoInfo.description || `A curated list maintained by ${owner}`,
      lastChecked: twentyYearsAgo.toISOString(),
      branch: repoInfo.default_branch
    };
    
    // Add to tracked repositories
    trackedRepos.push(newRepo);
    
    // Save updated list
    await saveTrackedRepositories(trackedRepos);
    
    console.log(`✅ Successfully added ${owner}/${repo} to tracked repositories!`);
    console.log(`To scrape this list now, run: npm run scrape`);
    
  } catch (error) {
    console.error('Error adding repository:', error);
    process.exit(1);
  }
}

// Main execution
if (process.argv.length < 3) {
  console.error('Please provide a GitHub repository URL');
  console.log('Usage: npm run add-list <github-repo-url>');
  console.log('Example: npm run add-list https://github.com/sindresorhus/awesome');
  process.exit(1);
}

const githubUrl = process.argv[2];
addRepository(githubUrl)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed to add repository:', error);
    process.exit(1);
  }); 