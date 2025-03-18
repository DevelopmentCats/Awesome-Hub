'use client';

import { Box, Heading, Text, Stack, Input, Button, Flex } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { AppLayout } from '@/components/layout';
import { useAppContext } from '@/context/AppContext';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const { setCurrentSection } = useAppContext();
  
  useEffect(() => {
    // Set current section for contextual sidebar
    setCurrentSection('search');
  }, [setCurrentSection]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement search functionality later
    console.log('Searching for:', searchQuery);
  };
  
  return (
    <AppLayout>
      <Box px={6} py={8} maxWidth="900px" mx="auto">
        <Stack gap={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={4}>
              Search Awesome Lists
            </Heading>
            <Text mb={6}>
              Search across all awesome lists to find exactly what you're looking for.
            </Text>
          </Box>
          
          <Box as="form" onSubmit={handleSearch}>
            <Flex gap={4}>
              <Box position="relative" flex={1}>
                <Box 
                  position="absolute" 
                  left="16px" 
                  top="50%" 
                  transform="translateY(-50%)" 
                  zIndex="1" 
                  color="gray.400"
                >
                  <FaSearch />
                </Box>
                <Input 
                  size="lg"
                  width="100%"
                  placeholder="Search for anything..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  paddingLeft="45px"
                />
              </Box>
              <Button 
                type="submit" 
                colorScheme="purple" 
                size="lg"
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </Flex>
          </Box>
          
          <Box textAlign="center" py={10}>
            <Text color="gray.500">
              Search functionality will be implemented soon. Stay tuned!
            </Text>
          </Box>
        </Stack>
      </Box>
    </AppLayout>
  );
} 