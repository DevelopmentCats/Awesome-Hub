'use client';

/**
 * Save data to localStorage
 */
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * Get data from localStorage
 */
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch (error) {
        console.error(`Error parsing stored data for key ${key}:`, error);
      }
    }
  }
  return defaultValue;
}

/**
 * Get user's favorite lists
 */
export function getFavorites(): string[] {
  return getFromStorage<string[]>('awesome-hub-favorites', []);
}

/**
 * Save user's favorite lists
 */
export function saveFavorites(favorites: string[]): void {
  saveToStorage('awesome-hub-favorites', favorites);
}

/**
 * Add a list to favorites
 */
export function addToFavorites(listId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(listId)) {
    favorites.push(listId);
    saveFavorites(favorites);
  }
}

/**
 * Remove a list from favorites
 */
export function removeFromFavorites(listId: string): void {
  const favorites = getFavorites();
  const updated = favorites.filter(id => id !== listId);
  saveFavorites(updated);
}

/**
 * Check if a list is in favorites
 */
export function isFavorite(listId: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(listId);
} 