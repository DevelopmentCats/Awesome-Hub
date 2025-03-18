'use client';

import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import { useAppContext } from '@/context/AppContext';
import { ScrollContainer } from '@/components/ui';
import ListsSidebar from '@/components/sidebar/ListsSidebar';
import FavoritesSidebar from '@/components/sidebar/FavoritesSidebar';
import SearchSidebar from '@/components/sidebar/SearchSidebar';

export interface AppLayoutProps {
  children: ReactNode;
  activeListRepo?: string;
  disableScrollContainer?: boolean;
}

export default function AppLayout({ 
  children, 
  activeListRepo,
  disableScrollContainer = false
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode } = useAppContext();
  
  // Track current section based on pathname
  const [currentSection, setCurrentSection] = useState<'home' | 'list' | 'search' | 'favorites'>('home');
  
  // Determine if sidebar should be shown on mobile
  const showSidebarOnMobile = useBreakpointValue({ base: false, lg: true });
  
  useEffect(() => {
    // Determine current section based on pathname
    if (pathname.startsWith('/search')) {
      setCurrentSection('search');
    } else if (pathname.startsWith('/favorites')) {
      setCurrentSection('favorites');
    } else if (pathname.startsWith('/lists/')) {
      setCurrentSection('list');
    } else {
      setCurrentSection('home');
    }
  }, [pathname]);

  // Handle list selection
  function handleSelectList(owner: string, repo: string) {
    router.push(`/lists/${repo}`);
  }
  
  // Render appropriate sidebar content based on current section
  const renderSidebarContent = () => {
    switch (currentSection) {
      case 'search':
        return <SearchSidebar />;
      case 'favorites':
        return <FavoritesSidebar />;
      case 'home':
      case 'list':
      default:
        return (
          <ListsSidebar 
            activeListRepo={activeListRepo} 
            onSelectList={handleSelectList} 
          />
        );
    }
  };
  
  return (
    <Box 
      height="100vh"
      display="flex" 
      flexDirection="column"
      overflow="hidden"
    >
      <AppHeader compact={true} />
      
      <Flex 
        flex="1" 
        pt="64px" // Fixed header height
        overflow="hidden"
        width="100%"
        position="relative"
        flexDirection="column"
      >
        <Flex 
          flex="1" 
          width="100%" 
          overflow="hidden"
          bg={isDarkMode ? "gray.900" : "gray.100"}
          position="relative"
          p={2}
          pt={3}
          pb={3}
          gap={3}
        >
          {/* Sidebar container with border and shadow */}
          <Box 
            boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.15)"
            zIndex="base"
            height="100%"
            borderRadius="md"
            overflow="hidden"
            border="1px solid"
            borderColor={isDarkMode ? "gray.700" : "gray.200"}
            bg={isDarkMode ? "gray.800" : "white"}
            width={{ base: "0px", lg: "240px" }}
            display={{ base: "none", lg: "block" }}
          >
            {renderSidebarContent()}
          </Box>
          
          {/* Main content container - conditionally wrap in ScrollContainer */}
          {disableScrollContainer ? (
            <Box 
              flex="1" 
              height="100%"
              bg={isDarkMode ? "gray.800" : "white"}
              position="relative"
              borderRadius="md"
              boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.15)"
              border="1px solid"
              borderColor={isDarkMode ? "gray.700" : "gray.200"}
              overflow="hidden"
            >
              {children}
            </Box>
          ) : (
            <ScrollContainer 
              flex="1" 
              height="100%"
              overflowY="auto" 
              bg={isDarkMode ? "gray.800" : "white"}
              position="relative"
              borderRadius="md"
              boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.15)"
              border="1px solid"
              borderColor={isDarkMode ? "gray.700" : "gray.200"}
            >
              {children}
            </ScrollContainer>
          )}
        </Flex>
      </Flex>
    </Box>
  );
} 