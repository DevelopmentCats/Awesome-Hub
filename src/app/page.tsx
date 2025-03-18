'use client';

import { Box, Heading, Text, Stack, SimpleGrid, Button, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ListItem } from '@/types';
import { getAllNewItems } from '@/utils/storage';
import { FaArrowRight } from 'react-icons/fa';
import Link from "next/link";
import { useAppContext } from '@/context/AppContext';
import { AppLayout } from '@/components/layout';
import { ItemCard } from '@/components/ui';

// Extended ListItem type to include listName
interface ExtendedListItem extends ListItem {
  listName?: string;
  listId?: string;
}

export default function Home() {
  const [newItems, setNewItems] = useState<ExtendedListItem[]>([]);
  const { isDarkMode, setCurrentSection, favorites, addToFavorites, removeFromFavorites } = useAppContext();
  
  // Load new items on component mount
  useEffect(() => {
    // Get the 10 most recent items
    const items = getAllNewItems().slice(0, 10);
    setNewItems(items);
    
    // Set current section for contextual sidebar
    setCurrentSection('home');
  }, [setCurrentSection]);
  
  // Handle favorite toggle
  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };
  
  return (
    <AppLayout>
      <Box px={6} py={8} maxWidth="1400px" mx="auto">
        <Stack gap={8} align="stretch">
          <Box 
            textAlign="center" 
            py={10} 
            px={4} 
            bg={isDarkMode ? "gray.800" : "white"} 
            borderRadius="lg" 
            boxShadow="md"
            border="1px solid"
            borderColor={isDarkMode ? "gray.700" : "gray.200"}
          >
            <Heading as="h1" size="2xl" mb={4} bgGradient="linear(to-r, purple.400, purple.600)" bgClip="text">
              Welcome to Awesome-Hub
            </Heading>
            <Text fontSize="xl" maxW="800px" mx="auto" color={isDarkMode ? "gray.300" : "gray.600"}>
              Your visual gateway to GitHub's curated Awesome Lists. Discover high-quality resources
              across programming languages, frameworks, and tools.
            </Text>
          </Box>
          
          {newItems.length > 0 && (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h2" size="lg">
                  Recently Added
                </Heading>
                <Link href="/latest">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Text>View all</Text>
                    <FaArrowRight />
                  </Box>
                </Link>
              </Flex>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {newItems.map(item => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    url={item.url}
                    category={item.category}
                    demoUrl={item.demoUrl}
                    sourceCodeUrl={item.sourceCodeUrl}
                    license={item.license}
                    techStack={item.techStack}
                    listName={item.listName || 'Unknown List'}
                    listId={item.listId || ''}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(item.id)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
          
          <Box 
            p={6} 
            borderRadius="lg" 
            bg={isDarkMode ? "purple.900" : "purple.50"}
            border="1px solid"
            borderColor={isDarkMode ? "purple.800" : "purple.100"}
          >
            <Heading as="h2" size="md" mb={4}>
              Getting Started
            </Heading>
            <Text mb={4}>
              Browse through our collection of awesome lists, save your favorites, and discover new resources.
            </Text>
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <Link href="/search">
                <Button colorScheme="purple">
                  Search Resources
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline">
                  Browse Categories
                </Button>
              </Link>
            </Flex>
          </Box>
        </Stack>
      </Box>
    </AppLayout>
  );
} 