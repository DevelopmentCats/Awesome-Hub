'use client';

import { Box, VStack, Text, Heading, Flex, Input, Button, Stack } from '@chakra-ui/react';
import { useAppContext } from '@/context/AppContext';
import { FaSearch } from 'react-icons/fa';
import { ScrollContainer } from '@/components/ui';
import { useState, useEffect } from 'react';
import { getAllLists } from '@/utils/api';
import React from 'react';

interface SearchFilterOptions {
  selectedLists: string[];
  showWithDemos: boolean;
  showWithCode: boolean;
}

function SearchSidebar() {
  const { isDarkMode } = useAppContext();
  const [lists, setLists] = useState<{ name: string; id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilterOptions>({
    selectedLists: [],
    showWithDemos: false,
    showWithCode: false
  });
  
  useEffect(() => {
    async function loadLists() {
      try {
        setLoading(true);
        const allLists = await getAllLists();
        if (allLists && allLists.length > 0) {
          const formattedLists = allLists.map(list => ({
            name: list.name || list.repo,
            id: `${list.owner}/${list.repo}`
          }));
          setLists(formattedLists);
        }
      } catch (err) {
        console.error('Error loading lists:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadLists();
  }, []);
  
  const handleListFilter = (listId: string) => {
    setFilters(prev => {
      if (prev.selectedLists.includes(listId)) {
        return {
          ...prev,
          selectedLists: prev.selectedLists.filter(id => id !== listId)
        };
      } else {
        return {
          ...prev,
          selectedLists: [...prev.selectedLists, listId]
        };
      }
    });
  };
  
  return (
    <Flex 
      height="100%" 
      direction="column"
    >
      <Box
        px={4} 
        py={4} 
        borderBottom="1px" 
        borderColor={isDarkMode ? "gray.700" : "gray.200"}
        bg={isDarkMode ? "gray.750" : "gray.50"}
      >
        <Heading size="md" fontWeight="600" color={isDarkMode ? 'purple.300' : 'purple.700'}>
          <Flex align="center" gap={2}>
            <FaSearch />
            <Text>Search Filters</Text>
          </Flex>
        </Heading>
      </Box>
      
      <ScrollContainer 
        flex="1" 
        p={4}
        bg={isDarkMode ? "gray.800" : "white"}
        overflowY="auto"
      >
        <VStack align="stretch" gap={4}>
          <Box>
            <Text fontWeight="500" mb={2}>Feature Filters</Text>
            <Stack direction="column" gap={2}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={filters.showWithDemos}
                  onChange={() => setFilters(prev => ({ ...prev, showWithDemos: !prev.showWithDemos }))}
                  style={{ accentColor: 'var(--chakra-colors-purple-500)' }}
                />
                <Text>With demo</Text>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={filters.showWithCode}
                  onChange={() => setFilters(prev => ({ ...prev, showWithCode: !prev.showWithCode }))}
                  style={{ accentColor: 'var(--chakra-colors-purple-500)' }}
                />
                <Text>With source code</Text>
              </label>
            </Stack>
          </Box>
          
          <Box>
            <Text fontWeight="500" mb={2}>Lists</Text>
            {lists.length > 0 ? (
              <VStack align="stretch" maxH="300px" overflowY="auto" gap={2}>
                {lists.map(list => (
                  <label 
                    key={list.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer' 
                    }}
                  >
                    <input 
                      type="checkbox"
                      checked={filters.selectedLists.includes(list.id)}
                      onChange={() => handleListFilter(list.id)}
                      style={{ accentColor: 'var(--chakra-colors-purple-500)' }}
                    />
                    <Text fontSize="sm" style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      maxWidth: '100%' 
                    }}>
                      {list.name}
                    </Text>
                  </label>
                ))}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.500">Loading lists...</Text>
            )}
          </Box>
          
          <Button
            colorScheme="purple"
            size="sm"
            mt={2}
            onClick={() => console.log('Filters applied:', filters)}
          >
            Apply Filters
          </Button>
        </VStack>
      </ScrollContainer>
    </Flex>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(SearchSidebar); 