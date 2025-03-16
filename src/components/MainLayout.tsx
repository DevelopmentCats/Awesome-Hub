'use client';

import { Box, Container } from '@chakra-ui/react';
import Header from '@/components/Header';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex="1" as="main" py={6}>
        <Container maxW="container.xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
} 