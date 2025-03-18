'use client';

import { Box, Heading, Text, Stack, SimpleGrid, Button } from '@chakra-ui/react';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout';
import { ItemCard } from '@/components/ui';
import { getFavoriteItems } from '@/utils/clientStorage';

interface FavoriteItem {
  id: string;
  title: string;
  url: string;
  description: string;
  listName: string;
  listId: string;
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
}

export default function Favorites() {
  const { setCurrentSection, removeItemFromFavorites } = useAppContext();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  
  useEffect(() => {
    // Set current section for contextual sidebar
    setCurrentSection('favorites');
    
    // Load actual favorites data from storage
    const items = getFavoriteItems();
    
    // We need to transform these items for display since they may not have all fields
    const displayItems = items.map(item => ({
      ...item,
      url: item.url || '#',
      description: item.description || 'No description available'
    }));
    
    setFavoriteItems(displayItems);
  }, [setCurrentSection]);
  
  return (
    <AppLayout>
      <Box px={6} py={8} maxWidth="1400px" mx="auto">
        <Stack gap={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={4}>
              Your Favorites
            </Heading>
            <Text mb={6}>
              View and manage your favorite resources from awesome lists.
            </Text>
          </Box>
          
          {favoriteItems.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {favoriteItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  url={item.url}
                  listName={item.listName}
                  listId={item.listId}
                  demoUrl={item.demoUrl}
                  sourceCodeUrl={item.sourceCodeUrl}
                  license={item.license}
                  techStack={item.techStack}
                  onToggleFavorite={removeItemFromFavorites}
                  isFavorite={true}
                  isOnFavoritesPage={true}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={10}>
              <Text color="gray.500" mb={4}>
                You haven't added any favorites yet. Browse the awesome lists and star items you like.
              </Text>
              <Link href="/">
                <Button colorScheme="purple">
                  Browse Lists
                </Button>
              </Link>
            </Box>
          )}
        </Stack>
      </Box>
    </AppLayout>
  );
} 