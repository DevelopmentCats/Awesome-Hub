'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Spinner, Text } from '@chakra-ui/react';

export default function ListsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the home page which now has the sidebar with lists
    router.replace('/');
  }, [router]);
  
  return (
    <Center minH="50vh">
      <Spinner size="xl" color="purple.500" />
      <Text ml={4}>Redirecting to home...</Text>
    </Center>
  );
} 