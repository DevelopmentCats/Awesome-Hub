import { existsSync, readdir as readdirCb, readFile as readFileCb } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { AwesomeList } from '@/types';

const readdir = promisify(readdirCb);
const readFile = promisify(readFileCb);

const DATA_DIR = join(process.cwd(), 'data', 'lists');

// Type for the list metadata without full items
interface ListMetadata {
  id: string;
  name: string;
  description: string;
  owner: string;
  repo: string;
  lastUpdated: string;
  itemCount: number;
}

/**
 * GET handler for fetching all available lists with their metadata
 */
export async function GET() {
  try {
    // Check if data directory exists
    if (!existsSync(DATA_DIR)) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Read the directory to find all JSON files
    const files = await readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'tracked-repos.json');
    
    if (jsonFiles.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Read each file and extract essential metadata
    const lists: ListMetadata[] = [];
    
    for (const file of jsonFiles) {
      try {
        const content = await readFile(join(DATA_DIR, file), 'utf-8');
        const list = JSON.parse(content) as AwesomeList;
        
        // Include only essential metadata for the lists overview
        lists.push({
          id: list.id,
          name: list.name,
          description: list.description,
          owner: list.owner,
          repo: list.repo,
          lastUpdated: list.lastUpdated,
          itemCount: list.items?.length || 0
        });
      } catch (err) {
        console.error(`Error reading list file ${file}:`, err);
        // Skip this file and continue with others
      }
    }
    
    return new Response(JSON.stringify(lists), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching all lists:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch lists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 