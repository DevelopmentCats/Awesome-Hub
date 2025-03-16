import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { AwesomeList, ListItem } from '@/types';

// Define the data directory
const DATA_DIR = path.join(process.cwd(), 'data', 'lists');

/**
 * GET /api/lists/new - Get all new items across lists
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 7;
    
    const newItems: ListItem[] = [];
    const now = new Date();
    const newThreshold = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    if (!existsSync(DATA_DIR)) {
      return NextResponse.json(newItems);
    }
    
    // Read all list files
    const files = await readdir(DATA_DIR);
    const listFiles = files.filter(file => 
      file.endsWith('.json') && file !== 'tracked-repos.json'
    );
    
    // Process each list file
    for (const file of listFiles) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const data = await readFile(filePath, 'utf-8');
        const list: AwesomeList = JSON.parse(data);
        
        // Add items that are new or marked as new
        const itemsFromList = list.items
          .filter(item => {
            if (item.isNew) return true;
            
            const firstSeenTime = new Date(item.firstSeen).getTime();
            return (now.getTime() - firstSeenTime) < newThreshold;
          })
          .map(item => ({
            ...item,
            listId: list.id,
            listName: list.name
          }));
        
        newItems.push(...itemsFromList);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
    
    // Sort by firstSeen date, newest first
    newItems.sort((a, b) => 
      new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime()
    );
    
    return NextResponse.json(newItems);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 