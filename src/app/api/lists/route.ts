import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { AwesomeList, TrackedRepository } from '@/types';

// Define the data directory
const DATA_DIR = path.join(process.cwd(), 'data', 'lists');

// Ensure the data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

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

// File paths
function getListFilePath(owner: string, repo: string): string {
  return path.join(DATA_DIR, `${owner}-${repo}.json`);
}

function getTrackedReposFilePath(): string {
  return path.join(DATA_DIR, 'tracked-repos.json');
}

// Get tracked repositories from JSON file
async function getTrackedRepositories(): Promise<TrackedRepository[]> {
  try {
    await ensureDataDir();
    const filePath = getTrackedReposFilePath();
    
    if (!existsSync(filePath)) {
      await writeFile(filePath, JSON.stringify(DEFAULT_TRACKED_REPOS, null, 2));
      return DEFAULT_TRACKED_REPOS;
    }
    
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tracked repositories:', error);
    return DEFAULT_TRACKED_REPOS;
  }
}

// Get a specific list from JSON file
async function getStoredList(owner: string, repo: string): Promise<AwesomeList | null> {
  try {
    await ensureDataDir();
    const filePath = getListFilePath(owner, repo);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading list data for ${owner}/${repo}:`, error);
    return null;
  }
}

// Save list data to JSON file
async function saveStoredList(list: AwesomeList): Promise<void> {
  try {
    await ensureDataDir();
    const filePath = getListFilePath(list.owner, list.repo);
    await writeFile(filePath, JSON.stringify(list, null, 2));
  } catch (error) {
    console.error('Error saving list data:', error);
    throw error;
  }
}

// API handlers

// GET /api/lists - Get all tracked repositories
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');
    
    // If owner and repo are provided, return that specific list
    if (owner && repo) {
      const list = await getStoredList(owner, repo);
      if (!list) {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      return NextResponse.json(list);
    }
    
    // Otherwise return all tracked repositories
    const repos = await getTrackedRepositories();
    return NextResponse.json(repos);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/lists - Used by the background sync to save a processed list
export async function POST(request: Request) {
  try {
    const list: AwesomeList = await request.json();
    
    if (!list || !list.owner || !list.repo) {
      return NextResponse.json({ error: 'Invalid list data' }, { status: 400 });
    }
    
    await saveStoredList(list);
    
    // Update last checked timestamp in tracked repositories
    const repos = await getTrackedRepositories();
    const updated = repos.map(r => {
      if (r.owner === list.owner && r.repo === list.repo) {
        return {
          ...r,
          lastChecked: new Date().toISOString()
        };
      }
      return r;
    });
    
    await writeFile(getTrackedReposFilePath(), JSON.stringify(updated, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 