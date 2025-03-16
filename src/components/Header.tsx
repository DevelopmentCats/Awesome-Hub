'use client';

import { 
  Box, 
  Flex, 
  Heading, 
  Container,
  Stack,
  Button
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaHome, FaList, FaSearch, FaStar } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiGithub } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const ThemeIcon = mounted ? (theme === 'dark' ? FiSun : FiMoon) : FiMoon;
  
  return (
    <Box
      as="header"
      bg={mounted && theme === 'dark' ? 'brand.primary' : 'white'}
      borderBottomWidth="1px"
      borderBottomColor={mounted && theme === 'dark' ? 'gray.700' : 'gray.200'}
      py={3}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <NextLink href="/" passHref>
            <Box 
              as="span" 
              cursor="pointer"
            >
              <Heading
                as="h1"
                size="md"
                color={theme === 'dark' ? 'white' : 'gray.800'}
                bgGradient="linear(to-r, brand.secondary, brand.accent)"
                bgClip="text"
              >
                Awesome Hub
              </Heading>
            </Box>
          </NextLink>
          
          <Flex gap={4} align="center">
            <NextLink href="/" passHref>
              <Box 
                as="span"
                display="flex" 
                alignItems="center" 
                gap={2}
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                <FaHome /> Home
              </Box>
            </NextLink>
            
            <NextLink href="/lists" passHref>
              <Box 
                as="span"
                display="flex" 
                alignItems="center" 
                gap={2}
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                <FaList /> Lists
              </Box>
            </NextLink>
            
            <NextLink href="/search" passHref>
              <Box 
                as="span"
                display="flex" 
                alignItems="center" 
                gap={2}
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                <FaSearch /> Search
              </Box>
            </NextLink>
            
            <NextLink href="/favorites" passHref>
              <Box 
                as="span"
                display="flex" 
                alignItems="center" 
                gap={2}
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                <FaStar /> Favorites
              </Box>
            </NextLink>
            
            <Button
              aria-label="Toggle dark mode"
              variant="ghost"
              onClick={toggleTheme}
              size="sm"
            >
              <ThemeIcon />
            </Button>
            
            <NextLink 
              href="https://github.com/your-username/awesome-hub" 
              target="_blank"
              rel="noopener noreferrer"
              passHref
            >
              <Box 
                as="span"
                p={2}
                borderRadius="md"
                _hover={{ bg: 'gray.100' }}
                aria-label="GitHub"
                cursor="pointer"
              >
                <FiGithub />
              </Box>
            </NextLink>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
} 