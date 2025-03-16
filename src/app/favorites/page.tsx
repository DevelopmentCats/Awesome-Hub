'use client';

import { Box, Heading, Text, Stack, SimpleGrid, Card, Button, Badge, Flex } from '@chakra-ui/react';
import MainLayout from '@/components/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import { FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import NextLink from 'next/link';

interface FavoriteItem {
  id: string;
  title: string;
  url: string;
  description: string;
  listName: string;
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
}

export default function Favorites() {
  const { favorites, removeFromFavorites } = useAppContext();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  
  // This is a placeholder until we implement actual favorites loading
  useEffect(() => {
    // In the future, we'll load actual favorites data from storage
    // For now, we'll use dummy data if the user has any favorites
    if (favorites.length > 0) {
      const dummyItems: FavoriteItem[] = favorites.map(id => ({
        id,
        title: `Favorite Item ${id.substring(0, 8)}`,
        url: 'https://github.com',
        description: 'This is a placeholder for your favorited resource. Actual functionality will be implemented soon.',
        listName: 'Awesome List'
      }));
      setFavoriteItems(dummyItems);
    }
  }, [favorites]);
  
  return (
    <MainLayout>
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
              <Card.Root key={item.id} variant="outline">
                <Card.Header>
                  <Badge colorScheme="purple" mb={2}>{item.listName}</Badge>
                  <Heading size="md">{item.title}</Heading>
                </Card.Header>
                <Card.Body>
                  <Text 
                    mb={4}
                    height="4.5em"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {item.description}
                  </Text>
                  
                  {/* Display badges */}
                  <Flex wrap="wrap" gap={2} mb={4}>
                    {item.license && (
                      <Badge colorScheme="blue" borderRadius="full">
                        {item.license}
                      </Badge>
                    )}
                    {item.techStack && (
                      <Badge colorScheme="gray" borderRadius="full">
                        {item.techStack}
                      </Badge>
                    )}
                  </Flex>
                  
                  {/* Buttons for all links */}
                  <Flex wrap="wrap" gap={2} mb={2}>
                    <NextLink
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      passHref
                    >
                      <Button 
                        as="a"
                        colorScheme="purple"
                        size="sm"
                        mr={2}
                      >
                        Visit <Box as={FaExternalLinkAlt} ml={2} />
                      </Button>
                    </NextLink>
                    
                    {item.sourceCodeUrl && (
                      <NextLink
                        href={item.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        passHref
                      >
                        <Button as="a" size="sm" variant="outline" colorScheme="gray" mr={2}>
                          Source <Box as={FaExternalLinkAlt} ml={2} />
                        </Button>
                      </NextLink>
                    )}
                    
                    {item.demoUrl && (
                      <NextLink
                        href={item.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        passHref
                      >
                        <Button as="a" size="sm" variant="outline" colorScheme="teal" mr={2}>
                          Demo <Box as={FaExternalLinkAlt} ml={2} />
                        </Button>
                      </NextLink>
                    )}
                  </Flex>
                  
                  <Button 
                    variant="outline"
                    colorScheme="red"
                    size="sm"
                    onClick={() => removeFromFavorites(item.id)}
                  >
                    <Box as={FaTrash} mr={2} /> Remove
                  </Button>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={10}>
            <Text color="gray.500" mb={4}>
              You haven't added any favorites yet. Browse the awesome lists and star items you like.
            </Text>
            <NextLink href="/lists" passHref>
              <Button as="a" colorScheme="purple">
                Browse Lists
              </Button>
            </NextLink>
          </Box>
        )}
      </Stack>
    </MainLayout>
  );
} 