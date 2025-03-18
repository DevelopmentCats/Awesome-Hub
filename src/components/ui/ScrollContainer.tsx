'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import { useAppContext } from '@/context/AppContext';
import { ReactNode } from 'react';

interface ScrollContainerProps extends BoxProps {
  children: ReactNode;
  thumbSize?: string;
  trackColor?: string;
  thumbColor?: string;
}

export default function ScrollContainer({
  children,
  thumbSize = '4px',
  trackColor,
  thumbColor,
  ...rest
}: ScrollContainerProps) {
  const { isDarkMode } = useAppContext();
  
  // Default colors based on theme
  const defaultTrackColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const defaultThumbColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  
  return (
    <Box
      {...rest}
      css={{
        '&::-webkit-scrollbar': { 
          width: thumbSize 
        },
        '&::-webkit-scrollbar-track': { 
          background: trackColor || defaultTrackColor 
        },
        '&::-webkit-scrollbar-thumb': { 
          background: thumbColor || defaultThumbColor, 
          borderRadius: '4px' 
        }
      }}
    >
      {children}
    </Box>
  );
} 