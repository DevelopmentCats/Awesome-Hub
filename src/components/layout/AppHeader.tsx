'use client';

import { 
  Box, 
  Flex, 
  Heading, 
  Container,
  Button,
  Text
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaHome, FaSearch, FaStar } from 'react-icons/fa';
import { FiSun, FiMoon, FiGithub } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { usePathname } from 'next/navigation';

interface AppHeaderProps {
  compact?: boolean;
}

export default function AppHeader({ compact = false }: AppHeaderProps) {
  const { isDarkMode, toggleColorMode } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Determine active section for highlighting
  const isHomeActive = pathname === '/';
  const isSearchActive = pathname.startsWith('/search');
  const isFavoritesActive = pathname.startsWith('/favorites');
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <Box
      as="header"
      bg={isDarkMode ? 'gray.900' : 'white'}
      borderBottomWidth="1px"
      borderBottomColor={isDarkMode ? 'gray.700' : 'gray.200'}
      py={compact ? 1 : 2}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="sticky"
      height="64px"
      display="flex"
      alignItems="center"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)"
    >
      <Box width="100%" px={0}>
        <Flex justify="space-between" align="center" width="100%" px={2}>
          <Link href="/" prefetch>
            <Flex 
              align="center"
              cursor="pointer"
              pl={1}
            >
              <Heading
                as="h1"
                size="2xl"
                color="purple.500"
                fontWeight="bold"
                letterSpacing="tight"
                fontSize={{ base: "24px", md: "32px", lg: "36px" }}
              >
                Awesome-Hub
              </Heading>
            </Flex>
          </Link>
          
          <Flex ml="auto" gap={2} align="center" pr={1.5}>
            <Link href="/" prefetch>
              <Box 
                as="div"
                display="flex" 
                alignItems="center" 
                gap={2}
                cursor="pointer"
                color={isHomeActive 
                  ? "purple.500" 
                  : (isDarkMode ? "gray.300" : "gray.700")
                }
                _hover={{ color: "purple.500" }}
                transition="color 0.2s"
                fontWeight={isHomeActive ? "semibold" : "normal"}
              >
                <FaHome /> 
                {!compact && <Text display={{ base: 'none', md: 'block' }}>Home</Text>}
              </Box>
            </Link>
            
            <Link href="/search" prefetch>
              <Box 
                as="div"
                display="flex" 
                alignItems="center" 
                gap={2}
                cursor="pointer"
                color={isSearchActive 
                  ? "purple.500" 
                  : (isDarkMode ? "gray.300" : "gray.700")
                }
                _hover={{ color: "purple.500" }}
                transition="color 0.2s"
                fontWeight={isSearchActive ? "semibold" : "normal"}
              >
                <FaSearch /> 
                {!compact && <Text display={{ base: 'none', md: 'block' }}>Search</Text>}
              </Box>
            </Link>
            
            <Link href="/favorites" prefetch>
              <Box 
                as="div"
                display="flex" 
                alignItems="center" 
                gap={2}
                cursor="pointer"
                color={isFavoritesActive 
                  ? "purple.500" 
                  : (isDarkMode ? "gray.300" : "gray.700")
                }
                _hover={{ color: "purple.500" }}
                transition="color 0.2s"
                fontWeight={isFavoritesActive ? "semibold" : "normal"}
              >
                <FaStar /> 
                {!compact && <Text display={{ base: 'none', md: 'block' }}>Favorites</Text>}
              </Box>
            </Link>
            
            <Button
              aria-label="Toggle dark mode"
              variant="ghost"
              onClick={toggleColorMode}
              size="sm"
              color={isDarkMode ? "gray.300" : "gray.700"}
              _hover={{ color: "purple.500" }}
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </Button>
            
            <a 
              href="https://github.com/DevelopmentCats/Awesome-Hub" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px',
                borderRadius: '4px',
                color: isDarkMode ? "var(--chakra-colors-gray-300)" : "var(--chakra-colors-gray-700)",
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              aria-label="GitHub"
              onMouseOver={(e) => e.currentTarget.style.color = "var(--chakra-colors-purple-500)"}
              onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? "var(--chakra-colors-gray-300)" : "var(--chakra-colors-gray-700)"}
            >
              <FiGithub />
            </a>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
} 