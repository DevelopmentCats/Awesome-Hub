'use client';

import { AwesomeList, TrackedRepository, ListItem } from '@/types';

/**
 * Get all tracked repositories
 */
export async function getTrackedRepositories(): Promise<TrackedRepository[]> {
  const response = await fetch('/api/lists');
  if (!response.ok) {
    throw new Error(`Failed to fetch repositories: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get all lists with full data
 */
export async function getAllLists(): Promise<AwesomeList[]> {
  try {
    const response = await fetch('/api/lists/all');
    if (!response.ok) {
      throw new Error(`Failed to fetch all lists: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching all lists:', error);
    return [];
  }
}

/**
 * Get a specific list
 */
export async function getList(owner: string, repo: string): Promise<AwesomeList | null> {
  try {
    const response = await fetch(`/api/lists?owner=${owner}&repo=${repo}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch list: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching list:', error);
    return null;
  }
}

/**
 * Get all new items across all lists
 */
export async function getNewItems(days: number = 7): Promise<ListItem[]> {
  try {
    const response = await fetch(`/api/lists/new?days=${days}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch new items: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching new items:', error);
    return [];
  }
} 