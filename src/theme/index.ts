'use client';

import { createSystem, defaultConfig } from '@chakra-ui/react';

// Updated colors with proper value wrapping for Chakra UI V3
const colors = {
  brand: {
    primary: { value: '#121212' }, // Black
    secondary: { value: '#8A2BE2' }, // Purple
    accent: { value: '#FF3131' }, // Red
  },
  dark: {
    bg: { value: '#121212' },
    text: { value: '#F7F7F7' },
  },
  light: {
    bg: { value: '#F7F7F7' },
    text: { value: '#121212' },
  },
  purple: {
    50: { value: '#f5f3ff' },
    100: { value: '#ede9fe' },
    200: { value: '#ddd6fe' },
    300: { value: '#c4b5fd' },
    400: { value: '#a78bfa' },
    500: { value: '#8a2be2' }, // Main brand purple
    600: { value: '#7c3aed' },
    700: { value: '#6d28d9' },
    800: { value: '#5b21b6' },
    900: { value: '#4c1d95' },
  },
};

// Define z-index values to use consistently across the app
const zIndices = {
  hide: { value: -1 },
  base: { value: 0 },
  docked: { value: 10 },
  dropdown: { value: 1000 },
  sticky: { value: 1100 },
  banner: { value: 1200 },
  overlay: { value: 1300 },
  modal: { value: 1400 },
  popover: { value: 1500 },
  skipLink: { value: 1600 },
  toast: { value: 1700 },
  tooltip: { value: 1800 },
};

// Define your custom theme tokens
const customTokens = {
  colors, // Now properly formatted with value wrappers
  fonts: {
    heading: { value: 'system-ui, sans-serif' },
    body: { value: 'system-ui, sans-serif' },
  },
  zIndices, // Add z-index values to the theme
  radii: {
    sm: { value: '0.125rem' },
    md: { value: '0.375rem' },
    lg: { value: '0.5rem' },
    xl: { value: '0.75rem' },
    '2xl': { value: '1rem' },
    full: { value: '9999px' },
  },
  shadows: {
    sm: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
    lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  },
};

// Create the system with custom tokens
export const system = createSystem(defaultConfig, {
  theme: {
    tokens: customTokens,
  },
});

// If you have component-specific styling
// export const system = createSystem(defaultConfig, {
//   components: {
//     Button: {
//       baseStyle: {
//         fontWeight: 'bold',
//       },
//     },
//   },
//   theme: {
//     tokens: customTokens,
//   },
// }); 