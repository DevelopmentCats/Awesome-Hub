'use client';

import { Box, Heading, SimpleGrid, Text, Stack, Spinner, Center, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { checkSystemReady } from '@/utils/system';
import { getAllLists } from '@/utils/api';
import { AwesomeList } from '@/types';
import Image from 'next/image';

export default function Lists() {
  const [lists, setLists] = useState<AwesomeList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    async function loadLists() {
      try {
        setLoading(true);
        
        // Check if system has data available
        const ready = await checkSystemReady();
        
        if (!ready) {
          setLoading(false);
          // Just show a message that data is being processed in the background
          setError('Our system is preparing the awesome lists. Please check back soon!');
          return;
        }
        
        // Get available lists
        const allLists = await getAllLists();
        if (allLists && allLists.length > 0) {
          setLists(allLists);
          setError(null);
        } else {
          setError('No awesome lists available yet. Please check back soon!');
        }
      } catch (err) {
        console.error('Error loading lists:', err);
        setError('Something went wrong. Our system is collecting awesome lists in the background - please check back soon!');
      } finally {
        setLoading(false);
      }
    }
    
    loadLists();
  }, []);
  
  function handleListClick(owner: string, repo: string): void {
    router.push(`/lists/${repo}`);
  }
  
  if (loading) {
    return (
      <MainLayout>
        <Center py={20}>
          <Stack gap={4} align="center">
            <Spinner size="xl" color="purple.500" />
            <Text>Loading available awesome lists...</Text>
          </Stack>
        </Center>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <Center py={20}>
          <Stack gap={4} align="center" maxW="600px" textAlign="center">
            <Text fontSize="lg">{error}</Text>
            <Text fontSize="sm" color="gray.500">
              Awesome lists are being collected and processed in the background. 
              No action is needed - just check back later!
            </Text>
          </Stack>
        </Center>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Awesome Lists
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Explore curated collections of awesome resources
        </Text>
      </Box>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={10}>
        {lists.map((list) => (
          <Box
            key={`${list.owner}/${list.repo}`}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="sm"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'md' }}
            onClick={() => handleListClick(list.owner, list.repo)}
          >
            <Box position="relative" width="100%" height="100px">
              <Box 
                bg="gray.200" 
                width="100%" 
                height="100px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Text fontWeight="bold">{list.name}</Text>
              </Box>
            </Box>
            
            <Box p={4}>
              <Heading as="h3" size="md" mb={2}>
                {list.name}
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={2} height="40px" overflow="hidden">
                {list.description || `A curated list maintained by ${list.owner}`}
              </Text>
              <Text color="purple.500" fontSize="xs" fontWeight="bold">
                {list.owner}/{list.repo}
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </MainLayout>
  );
} 