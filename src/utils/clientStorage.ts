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

interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  url: string;
  listName: string;
  listId: string;
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
}

/**
 * Get user's favorite items
 */
export function getFavoriteItems(): FavoriteItem[] {
  return getFromStorage<FavoriteItem[]>('awesome-hub-favorite-items', []);
}

/**
 * Save user's favorite items
 */
export function saveFavoriteItems(items: FavoriteItem[]): void {
  saveToStorage('awesome-hub-favorite-items', items);
}

/**
 * Add an item to favorites
 */
export function addFavoriteItem(item: FavoriteItem): void {
  const items = getFavoriteItems();
  
  // Ensure we have valid values for important fields
  const enhancedItem = {
    ...item,
    listName: item.listName || 'Unknown List',
    listId: item.listId || '',
    description: item.description || ''
  };
  
  if (!items.some(i => i.id === item.id)) {
    items.push(enhancedItem);
    saveFavoriteItems(items);
  }
}

/**
 * Remove an item from favorites
 */
export function removeFavoriteItem(itemId: string): void {
  const items = getFavoriteItems();
  const updated = items.filter(item => item.id !== itemId);
  saveFavoriteItems(updated);
}

/**
 * Check if an item is favorited
 */
export function isItemFavorite(itemId: string): boolean {
  const items = getFavoriteItems();
  return items.some(item => item.id === itemId);
} 