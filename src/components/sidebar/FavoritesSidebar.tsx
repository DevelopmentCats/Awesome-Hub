'use client';

import { Box, VStack, Text, Heading, Flex, Badge, Button } from '@chakra-ui/react';
import { useAppContext } from '@/context/AppContext';
import { FaStar, FaList } from 'react-icons/fa';
import { ScrollContainer } from '@/components/ui';
import { useState, useEffect } from 'react';
import { getFavoriteItems } from '@/utils/clientStorage';
import Link from 'next/link';

interface FavoriteList {
  listId: string;
  listName: string;
  itemCount: number;
}

export default function FavoritesSidebar() {
  const { isDarkMode, favorites } = useAppContext();
  const [favoriteLists, setFavoriteLists] = useState<FavoriteList[]>([]);
  
  useEffect(() => {
    // Get favorite items from storage
    const items = getFavoriteItems();
    
    // Group items by list
    const listMap = new Map<string, { listId: string; listName: string; items: any[] }>();
    
    items.forEach(item => {
      const listId = item.listId || 'unknown';
      const listName = item.listName || 'Unknown List';
      
      if (!listMap.has(listId)) {
        listMap.set(listId, { listId, listName, items: [] });
      }
      
      listMap.get(listId)?.items.push(item);
    });
    
    // Convert to array and sort by item count
    const lists = Array.from(listMap.values())
      .map(list => ({
        listId: list.listId,
        listName: list.listName,
        itemCount: list.items.length
      }))
      .sort((a, b) => b.itemCount - a.itemCount);
    
    setFavoriteLists(lists);
  }, [favorites]);
  
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
            <FaStar />
            <Text>Favorites</Text>
          </Flex>
        </Heading>
      </Box>
      
      <ScrollContainer 
        flex="1" 
        p={2}
        bg={isDarkMode ? "gray.800" : "white"}
        overflowY="auto"
      >
        <VStack align="stretch" gap={2} mt={2}>
          <Link href="/favorites" passHref>
            <Button
              w="full"
              variant="ghost"
              justifyContent="flex-start"
              colorScheme="purple"
              mb={2}
            >
              <Flex align="center" gap={2}>
                <FaStar />
                <Text>All Favorites</Text>
              </Flex>
            </Button>
          </Link>
          
          {favoriteLists.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text color={isDarkMode ? "gray.400" : "gray.500"}>
                No favorites yet
              </Text>
            </Box>
          ) : (
            favoriteLists.map(list => (
              <Box 
                key={list.listId}
                px={4}
                py={3}
                borderRadius="md"
                bg={isDarkMode ? "gray.700" : "gray.50"}
                boxShadow="sm"
                borderLeft="3px solid"
                borderLeftColor="purple.400"
              >
                <Flex justify="space-between" align="center">
                  <Text 
                    fontWeight="600"
                    color={isDarkMode ? "purple.200" : "purple.700"}
                    fontSize="sm"
                    fontStyle="italic"
                  >
                    {list.listName}
                  </Text>
                  <Badge colorScheme="purple">
                    {list.itemCount}
                  </Badge>
                </Flex>
              </Box>
            ))
          )}
        </VStack>
      </ScrollContainer>
    </Flex>
  );
} 