import { NextResponse } from 'next/server';

/**
 * Helper function to create JSON responses that works in both development and production
 * Handles the "Class constructor _Response cannot be invoked without 'new'" error
 */
export function createJsonResponse(data: any, options?: { status?: number; headers?: Record<string, string> }) {
  // Always use the constructor approach which works in both dev and prod
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {})
  };
  
  return new NextResponse(JSON.stringify(data), {
    status: options?.status || 200,
    headers
  });
} 