import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { spawn } from 'child_process';
import path from 'path';
import { existsSync, mkdir } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Schedule configuration
const INITIAL_DELAY = 10000; // 10 seconds after startup
const INTERVAL = 60 * 60 * 1000; // Every hour
const DATA_DIR = join(process.cwd(), 'data', 'lists');

// Track if scraper is running
let scraperRunning = false;
let lastRunTime = 0;
const MINIMUM_RUN_INTERVAL = 10 * 60 * 1000; // Minimum 10 minutes between runs

// Make sure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    console.log('Creating data directory...');
    try {
      await promisify(mkdir)(DATA_DIR, { recursive: true });
      console.log('Data directory created.');
    } catch (err) {
      console.error('Error creating data directory:', err);
    }
  }
}

app.prepare().then(async () => {
  // Ensure data directory exists
  await ensureDataDir();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Start server
  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
    
    // Run scraper after a short delay
    setTimeout(runScraper, INITIAL_DELAY);
    
    // Set up regular interval for scraper
    setInterval(() => {
      const now = Date.now();
      if (!scraperRunning && (now - lastRunTime) > MINIMUM_RUN_INTERVAL) {
        runScraper();
      } else if (scraperRunning) {
        console.log('Skipping scheduled scrape - scraper is already running');
      } else {
        console.log('Skipping scheduled scrape - ran too recently');
      }
    }, INTERVAL);
  });
});

function runScraper() {
  if (scraperRunning) {
    console.log('Scraper already running, skipping this run');
    return;
  }
  
  console.log('Running data scraper...');
  scraperRunning = true;
  lastRunTime = Date.now();
  
  const scraperPath = path.join(process.cwd(), 'scripts', 'scraper.ts');
  
  // Modified to include proper TypeScript Node options for path resolution
  const scraper = spawn('npx', 
    ['ts-node', 
    '--project', 'tsconfig.server.json',  // Use the server tsconfig
    scraperPath
    ], {
    stdio: 'inherit',
    env: { ...process.env, TS_NODE_TRANSPILE_ONLY: 'true' } // Speed up execution
  });
  
  // Set a timeout to release the lock if the scraper never completes
  const timeoutId = setTimeout(() => {
    console.log('Scraper timed out after 30 minutes, releasing lock');
    scraperRunning = false;
  }, 30 * 60 * 1000); // 30 minute timeout
  
  scraper.on('close', (code) => {
    console.log(`Scraper completed with code ${code}`);
    clearTimeout(timeoutId);
    scraperRunning = false;
  });
  
  scraper.on('error', (err) => {
    console.error('Scraper process error:', err);
    clearTimeout(timeoutId);
    scraperRunning = false;
  });
} 