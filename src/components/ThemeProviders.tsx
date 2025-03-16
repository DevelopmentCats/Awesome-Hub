'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider, useTheme } from 'next-themes';
import { system } from '@/theme';
import { useEffect, useState } from 'react';

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  // Add this to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // For the first render, don't show anything to prevent hydration mismatch
  if (!mounted) {
    return (
      <ChakraProvider value={system}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
} 