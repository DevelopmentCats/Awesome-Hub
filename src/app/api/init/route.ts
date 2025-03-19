import { existsSync } from 'fs';
import path from 'path';

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
    
    return new Response(JSON.stringify({ 
      success: true, 
      ready: dataDirectoryExists && trackedReposFileExists,
      dataDirectoryExists,
      trackedReposFileExists,
      message: dataDirectoryExists && trackedReposFileExists 
        ? 'System is ready' 
        : 'System needs initialization. Please run the backend scraper.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    return new Response(JSON.stringify(
      { success: false, error: String(error), ready: false }
    ), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 