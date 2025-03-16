'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  
  const value = {
    isDarkMode,
    toggleColorMode,
    favorites,
    addToFavorites,
    removeFromFavorites,
    recentlyViewed,
    addToRecentlyViewed,
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