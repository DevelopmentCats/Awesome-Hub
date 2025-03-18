import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Path to tracked repos file
const TRACKED_REPOS_FILE = path.join(process.cwd(), 'data', 'lists', 'tracked-repos.json');

export async function GET() {
  try {
    // Default fallback mapping
    const defaultMapping: Record<string, string> = {
      'awesome-selfhosted': 'awesome-selfhosted'
    };
    
    if (existsSync(TRACKED_REPOS_FILE)) {
      const fileContent = readFileSync(TRACKED_REPOS_FILE, 'utf-8');
      const trackedRepos = JSON.parse(fileContent);
      
      // Generate mapping from tracked repos
      const mapping: Record<string, string> = {};
      trackedRepos.forEach((repo: any) => {
        if (repo.repo && repo.owner) {
          mapping[repo.repo] = repo.owner;
        }
      });
      
      return NextResponse.json({ ...defaultMapping, ...mapping });
    }
    
    return NextResponse.json(defaultMapping);
  } catch (error) {
    console.error('Error generating repo mapping:', error);
    return NextResponse.json(
      { 'awesome-selfhosted': 'awesome-selfhosted' },
      { status: 500 }
    );
  }
}
