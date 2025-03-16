import { existsSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Define the data directory
const DATA_DIR = path.join(process.cwd(), 'data', 'lists');
const TRACKED_REPOS_FILE = path.join(DATA_DIR, 'tracked-repos.json');

/**
 * GET /api/init - Check if the data directory and files exist
 * This is used by the frontend to determine if the system is ready
 */
export async function GET() {
  try {
    const dataDirectoryExists = existsSync(DATA_DIR);
    const trackedReposFileExists = existsSync(TRACKED_REPOS_FILE);
    
    return NextResponse.json({ 
      success: true, 
      ready: dataDirectoryExists && trackedReposFileExists,
      dataDirectoryExists,
      trackedReposFileExists,
      message: dataDirectoryExists && trackedReposFileExists 
        ? 'System is ready' 
        : 'System needs initialization. Please run the backend scraper.'
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      { success: false, error: String(error), ready: false },
      { status: 500 }
    );
  }
} 