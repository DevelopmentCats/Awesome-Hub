'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getFavorites, saveFavorites, 
  getFavoriteItems, addFavoriteItem, removeFavoriteItem, isItemFavorite 
} from '@/utils/clientStorage';

// Define available application sections
export type AppSection = 'home' | 'list' | 'search' | 'favorites';

interface AppContextType {
  // Theme
  isDarkMode: boolean;
  toggleColorMode: () => void;
  
  // Favorites
  favorites: string[];
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  
  // Recently Viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (id: string) => void;
  
  // Section tracking
  currentSection: AppSection;
  setCurrentSection: (section: AppSection) => void;
  
  // New functions
  addItemToFavorites: (item: {
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
  }) => void;
  removeItemFromFavorites: (id: string) => void;
  isItemInFavorites: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Recently viewed state
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  // Section tracking
  const [currentSection, setCurrentSection] = useState<AppSection>('home');
  
  // Load preferences from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load theme preference
      const savedTheme = localStorage.getItem('awesome-hub-theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
      
      // Load favorites
      const savedFavorites = localStorage.getItem('awesome-hub-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      
      // Load recently viewed
      const savedRecentlyViewed = localStorage.getItem('awesome-hub-recently-viewed');
      if (savedRecentlyViewed) {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      }
    }
  }, []);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('awesome-hub-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('awesome-hub-favorites', JSON.stringify(favorites));
    }
  }, [favorites]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('awesome-hub-recently-viewed', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);
  
  // Toggle color mode
  const toggleColorMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // Add to favorites
  const addToFavorites = (id: string) => {
    if (!favorites.includes(id)) {
      setFavorites(prev => [...prev, id]);
    }
  };
  
  // Remove from favorites
  const removeFromFavorites = (id: string) => {
    setFavorites(prev => prev.filter(item => item !== id));
  };
  
  // Add to recently viewed
  const addToRecentlyViewed = (id: string) => {
    setRecentlyViewed(prev => {
      // Remove the ID if it already exists
      const filtered = prev.filter(item => item !== id);
      
      // Add the ID to the beginning of the array
      const updated = [id, ...filtered];
      
      // Keep only the last 20 items
      return updated.slice(0, 20);
    });
  };
  
  // Add item to favorites with complete metadata
  const addItemToFavorites = (item: {
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
  }) => {
    // Add to favorites using the full item metadata
    addFavoriteItem(item);
    
    // Also update the simple favorites list for backward compatibility
    if (!favorites.includes(item.id)) {
      setFavorites(prev => [...prev, item.id]);
    }
  };
  
  // Remove from favorites
  const removeItemFromFavorites = (id: string) => {
    // Remove from detailed favorites
    removeFavoriteItem(id);
    
    // Also update the simple favorites list
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  // Check if item is in favorites
  const isItemInFavorites = (id: string) => {
    return isItemFavorite(id);
  };
  
  const value = {
    isDarkMode,
    toggleColorMode,
    favorites,
    addToFavorites,
    removeFromFavorites,
    addItemToFavorites,
    removeItemFromFavorites,
    isItemInFavorites,
    recentlyViewed,
    addToRecentlyViewed,
    currentSection,
    setCurrentSection,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 