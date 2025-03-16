'use client';

/**
 * Check if the system is ready (data directory and files exist)
 * 
 * This is used by the frontend to determine whether data is available
 * for display. The system is considered ready when the data directory
 * and necessary files exist.
 * 
 * The scraper runs automatically in the background, so this just checks
 * if data is available yet without initiating any scraping.
 */
export async function checkSystemReady(): Promise<boolean> {
  try {
    const response = await fetch('/api/init');
    const data = await response.json();
    return data.ready;
  } catch (error) {
    console.error('Error checking system readiness:', error);
    return false;
  }
}

/**
 * Check if the scraper is currently running
 */
