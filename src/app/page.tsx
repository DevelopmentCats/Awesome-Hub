'use client';

import { Box, Heading, Text, Stack, SimpleGrid, Button, Card, Flex, Badge } from '@chakra-ui/react';
import MainLayout from '@/components/MainLayout';
import { useEffect, useState } from 'react';
import { ListItem } from '@/types';
import { getAllNewItems } from '@/utils/storage';
import { FaArrowRight } from 'react-icons/fa';
import NextLink from "next/link"

export default function Home() {
  const [newItems, setNewItems] = useState<ListItem[]>([]);
  
  // Load new items on component mount
  useEffect(() => {
    // Get the 10 most recent items
    const items = getAllNewItems().slice(0, 10);
    setNewItems(items);
  }, []);
  
  return (
    <MainLayout>
      <Stack gap={8} align="stretch">
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="2xl" mb={4} bgGradient="linear(to-r, brand.secondary, brand.accent)" bgClip="text">
            Awesome Hub
          </Heading>
          <Text fontSize="xl">
            A visual repository of GitHub Awesome Lists
          </Text>
        </Box>
        
        <Box>
          <Heading as="h2" size="lg" mb={6}>
            What's New
          </Heading>
          
          {newItems.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {newItems.map((item) => (
                <Card.Root key={item.id} variant="outline" size="sm">
                  <Card.Header pb={0}>
                    <Text fontSize="sm" color="gray.500">
                      From {'Unknown List'}
                    </Text>
                    <Heading 
                      size="md" 
                      mb={2}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {item.title}
                    </Heading>
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
                      {item.isNew && (
                        <Badge colorScheme="green" borderRadius="full">
                          New
                        </Badge>
                      )}
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
                    <Flex wrap="wrap" gap={2}>
                      <NextLink href={item.url} target="_blank" rel="noopener noreferrer" passHref>
                        <Button
                          as="a"
                          size="sm"
                          colorScheme="purple"
                        >
                          <Box display="flex" alignItems="center">
                            Visit Resource <Box as={FaArrowRight} ml={2} />
                          </Box>
                        </Button>
                      </NextLink>
                      
                      {item.sourceCodeUrl && (
                        <NextLink
                          href={item.sourceCodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          passHref
                        >
                          <Button as="a" size="sm" variant="outline" colorScheme="gray">
                            Source <Box as={FaArrowRight} ml={2} />
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
                          <Button as="a" size="sm" variant="outline" colorScheme="teal">
                            Demo <Box as={FaArrowRight} ml={2} />
                          </Button>
                        </NextLink>
                      )}
                    </Flex>
                  </Card.Body>
                </Card.Root>
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={10}>
              <Text mb={4}>No new items found. Start by adding awesome lists to track.</Text>
              
              <NextLink href="/lists" passHref>
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  py={2}
                  px={4}
                  borderRadius="md"
                  fontWeight="medium"
                  bg="purple.500"
                  color="white"
                  _hover={{ bg: "purple.600" }}
                  cursor="pointer"
                >
                  Browse Lists
                </Box>
              </NextLink>
            </Box>
          )}
        </Box>
        
        <Box mt={8}>
          <Heading as="h2" size="lg" mb={4}>
            Getting Started
          </Heading>
          <Text mb={4}>
            Awesome Hub provides a beautiful interface for exploring GitHub's awesome lists.
            Browse through curated collections of resources on various topics, search across
            all lists, and keep track of recently added items.
          </Text>
          
          <NextLink href="/lists" passHref>
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              py={2}
              px={6}
              borderRadius="md"
              fontWeight="medium"
              bg="purple.500"
              color="white"
              _hover={{ bg: "purple.600" }}
              cursor="pointer"
              fontSize="lg"
            >
              <Box display="flex" alignItems="center">
                Explore Awesome Lists <Box as={FaArrowRight} ml={2} />
              </Box>
            </Box>
          </NextLink>
        </Box>
      </Stack>
    </MainLayout>
  );
} 