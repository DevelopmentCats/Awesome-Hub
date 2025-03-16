import { spawn } from 'child_process';
import path from 'path';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

let isRunning = false;

// Simple security key for internal use only
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'awesome-hub-internal-key';

/**
 * Verify that the request is coming from an internal source
 * This implements a simple authorization check
 */
function isInternalRequest(request: Request): boolean {
  const headersList = headers();
  const authHeader = headersList.get('x-api-key');
  
  // Allow requests from the same origin (our server)
  const origin = headersList.get('origin');
  const host = headersList.get('host');
  const referer = headersList.get('referer');
  
  const isLocalhost = 
    (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) ||
    (host && (host.includes('localhost') || host.includes('127.0.0.1')));
  
  const isServerSide = !origin && !referer;
  
  // Check API key or if it's a server-side request from localhost
  return Boolean(authHeader === INTERNAL_API_KEY) || Boolean(isServerSide) || Boolean(isLocalhost);
}

export async function POST(request: Request) {
  // Ensure only internal requests can trigger scraping
  if (!isInternalRequest(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (isRunning) {
    return NextResponse.json(
      { success: false, message: 'Scraper is already running' },
      { status: 429 }
    );
  }
  
  try {
    isRunning = true;
    const scraperPath = path.join(process.cwd(), 'scripts', 'scraper.ts');
    
    const scraper = spawn('npx', ['ts-node', scraperPath]);
    
    // Collect output
    let output = '';
    scraper.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    scraper.stderr?.on('data', (data) => {
      output += data.toString();
    });
    
    scraper.on('close', (code) => {
      console.log(`Scraper completed with code ${code}`);
      isRunning = false;
    });
    
    // Return success immediately but continue running the scraper
    setTimeout(() => { isRunning = false; }, 600000); // Safety timeout after 10 minutes
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scraper started' 
    });
  } catch (error) {
    isRunning = false;
    console.error('Failed to start scraper:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Also provide a way to check if scraper is running
export async function GET(request: Request) {
  // Only allow internal requests to check status
  if (!isInternalRequest(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({ 
    success: true,
    isRunning
  });
} 