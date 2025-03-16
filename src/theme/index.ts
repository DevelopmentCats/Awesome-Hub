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
};

// Define your custom theme tokens
const customTokens = {
  colors, // Now properly formatted with value wrappers
  fonts: {
    heading: { value: 'system-ui, sans-serif' },
    body: { value: 'system-ui, sans-serif' },
  },
};

// Create the system with custom tokens - no color mode configuration in Chakra UI V3
export const system = createSystem(defaultConfig, {
  theme: {
    tokens: customTokens,
  }
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