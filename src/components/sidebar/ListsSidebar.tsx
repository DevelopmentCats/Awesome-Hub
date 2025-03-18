'use client';

import { useState, useEffect } from 'react';
import { Box, VStack, Text, Heading, Spinner, Flex } from '@chakra-ui/react';
import { AwesomeList } from '@/types';
import { getAllLists } from '@/utils/api';
import { useAppContext } from '@/context/AppContext';
import { FaList } from 'react-icons/fa';
import { ScrollContainer } from '@/components/ui';
import React from 'react';

interface ListsSidebarProps {
  activeListRepo?: string;
  onSelectList: (owner: string, repo: string) => void;
}

// Define an extended interface with the missing properties
interface ExtendedAwesomeList extends AwesomeList {
  itemCount?: number;
}

function ListsSidebar({ activeListRepo, onSelectList }: ListsSidebarProps) {
  const [lists, setLists] = useState<ExtendedAwesomeList[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useAppContext();
  
  useEffect(() => {
    async function loadLists() {
      try {
        setLoading(true);
        const allLists = await getAllLists();
        if (allLists && allLists.length > 0) {
          setLists(allLists);
        }
      } catch (err) {
        console.error('Error loading lists:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadLists();
  }, []);
  
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
            <FaList />
            <Text>Awesome Lists</Text>
          </Flex>
        </Heading>
      </Box>
      
      <ScrollContainer 
        flex="1" 
        p={2}
        bg={isDarkMode ? "gray.800" : "white"}
        overflowY="auto"
      >
        {loading ? (
          <Flex justify="center" py={4}>
            <Spinner size="sm" color="purple.500" />
          </Flex>
        ) : (
          <VStack align="stretch" gap={2} mt={2}>
            {lists.map(list => (
              <Box 
                key={`${list.owner}-${list.repo}`}
                px={4}
                py={3}
                cursor="pointer"
                bg={activeListRepo === list.repo ? (isDarkMode ? "purple.900" : "purple.50") : "transparent"}
                borderLeft={activeListRepo === list.repo ? "4px solid" : "4px solid transparent"}
                borderLeftColor="purple.500"
                borderRadius="md"
                _hover={{ 
                  bg: isDarkMode ? "gray.700" : "gray.100",
                  boxShadow: "sm"
                }}
                onClick={() => onSelectList(list.owner, list.repo)}
                transition="all 0.2s ease"
                boxShadow={activeListRepo === list.repo ? "md" : "none"}
              >
                <Text 
                  fontWeight={activeListRepo === list.repo ? "600" : "normal"}
                  color={activeListRepo === list.repo ? (isDarkMode ? "purple.300" : "purple.700") : (isDarkMode ? "white" : "gray.800")}
                >
                  {list.name || list.repo}
                </Text>
                {list.itemCount && (
                  <Text 
                    fontSize="xs" 
                    color={isDarkMode ? "gray.400" : "gray.500"}
                    mt={1}
                  >
                    {list.itemCount} resources
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </ScrollContainer>
    </Flex>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ListsSidebar); 