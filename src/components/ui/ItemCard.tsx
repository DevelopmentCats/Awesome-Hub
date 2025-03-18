'use client';

import { Box, Heading, Text, Flex, Badge, Icon, chakra } from '@chakra-ui/react';
import { FaExternalLinkAlt, FaGithub, FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { useAppContext } from '@/context/AppContext';
import React from 'react';

// Create a Chakra-styled anchor element
const ChakraA = chakra('a');

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
  listName?: string;
  listId?: string;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
  hideCategory?: boolean;
  hideListName?: boolean;
  isOnFavoritesPage?: boolean;
  isNew?: boolean;
}

function ItemCard({
  id,
  title,
  description,
  url,
  category,
  demoUrl,
  sourceCodeUrl,
  license,
  techStack,
  listName,
  listId,
  onToggleFavorite,
  isFavorite = false,
  hideCategory = false,
  hideListName = false,
  isOnFavoritesPage = false,
  isNew = false
}: ItemCardProps) {
  const { isDarkMode, addItemToFavorites, removeItemFromFavorites, isItemInFavorites } = useAppContext();
  
  const handleToggleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const isFavorited = isItemInFavorites(id);
    
    if (isFavorited) {
      removeItemFromFavorites(id);
    } else {
      addItemToFavorites({
        id,
        title,
        description,
        url,
        listName: listName || 'Unknown List',
        listId: listId || '',
        demoUrl,
        sourceCodeUrl,
        license,
        techStack
      });
    }
    
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };
  
  const isFavorited = isItemInFavorites(id);
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      bg={isDarkMode ? "gray.800" : "white"}
      borderColor={isDarkMode ? "gray.700" : "gray.200"}
      p={0}
      transition="all 0.2s"
      position="relative"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
        borderColor: isDarkMode ? "purple.500" : "purple.300",
      }}
    >
      {/* Favorite Button - Positioned absolutely at the top right */}
      {onToggleFavorite && (
        <Box
          as="button"
          position="absolute"
          top="12px"
          right="12px"
          zIndex="1"
          onClick={handleToggleFavorite}
          borderRadius="full"
          bg={isFavorited ? "red.500" : isDarkMode ? "gray.700" : "gray.100"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="30px"
          h="30px"
          _hover={{
            bg: isFavorited ? "red.600" : isDarkMode ? "gray.600" : "gray.200",
          }}
          transition="all 0.2s"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Icon 
            as={isFavorited ? FaHeart : FaRegHeart} 
            color={isFavorited ? "white" : (isDarkMode ? "gray.400" : "gray.500")} 
            fontSize="sm"
          />
        </Box>
      )}

      {/* Card Header */}
      <Box p={4} pb={2}>
        <Flex 
          gap={2} 
          flexWrap="wrap" 
          mb={0}
          alignItems="flex-start"
        >
          {!hideListName && listName && (
            <Badge 
              colorScheme={isOnFavoritesPage ? "green" : "purple"}
              variant={isOnFavoritesPage ? "solid" : "subtle"}
              fontWeight={isOnFavoritesPage ? "bold" : "normal"}
              px={isOnFavoritesPage ? 3 : 2}
              py={isOnFavoritesPage ? 1 : 0.5}
              borderRadius={isOnFavoritesPage ? "full" : "md"}
              mb={2}
            >
              {listName}
            </Badge>
          )}
          {!hideCategory && category && (
            <Badge 
              colorScheme="blue" 
              variant="solid" 
              fontSize="xs"
              mb={2}
            >
              {category}
            </Badge>
          )}
          {license && (
            <Badge 
              colorScheme="green" 
              variant="subtle" 
              fontSize="xs"
              mb={2}
            >
              {license}
            </Badge>
          )}
          {techStack && (
            <Badge 
              colorScheme="gray" 
              variant="subtle" 
              fontSize="xs"
              mb={2}
            >
              {techStack}
            </Badge>
          )}
        </Flex>
        
        <Heading 
          as="h3" 
          size="md" 
          overflow="hidden"
          textOverflow="ellipsis"
          display="-webkit-box"
          style={{
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            height: "2.4em"
          }}
          mb={2}
          pr={8}
        >
          {title}
        </Heading>
      </Box>
      
      {/* Card Body */}
      <Box px={4} pb={3}>
        <Text 
          color={isDarkMode ? "gray.300" : "gray.600"}
          fontSize="sm" 
          height="4.5em"
          overflow="hidden"
          textOverflow="ellipsis"
          display="-webkit-box"
          style={{
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical"
          }}
          mb={4}
        >
          {description}
        </Text>
      </Box>
      
      {/* Card Footer */}
      <Flex 
        borderTop="1px" 
        borderColor={isDarkMode ? "gray.700" : "gray.200"}
        p={3}
        justifyContent="space-between"
        bg={isDarkMode ? "gray.750" : "gray.50"}
      >
        {/* Main Link Button */}
        <ChakraA 
          href={url} 
          target="_blank"
          rel="noopener noreferrer"
          textDecoration="none"
          _hover={{ textDecoration: "none" }}
          flex="1"
        >
          <Flex 
            alignItems="center" 
            justifyContent="center"
            bg="purple.500"
            color="white"
            py={1.5}
            px={3}
            borderRadius="md"
            fontSize="sm"
            fontWeight="medium"
            _hover={{ bg: "purple.600" }}
            height="100%"
          >
            Visit Resource
            <Icon as={FaExternalLinkAlt} ml={2} fontSize="xs" />
          </Flex>
        </ChakraA>
        
        {/* Additional buttons */}
        <Flex gap={2} ml={2}>
          {/* Demo button */}
          {demoUrl && (
            <ChakraA
              href={demoUrl} 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View demo"
              title="View demo"
              display="block"
            >
              <Flex
                alignItems="center"
                justifyContent="center"
                bg={isDarkMode ? "gray.700" : "gray.200"}
                color={isDarkMode ? "gray.200" : "gray.700"}
                p={2}
                borderRadius="md"
                height="100%"
                aspectRatio="1/1"
                _hover={{ 
                  bg: isDarkMode ? "gray.600" : "gray.300"
                }}
              >
                <Icon as={FaPlay} fontSize="sm" />
              </Flex>
            </ChakraA>
          )}
          
          {/* Source code button */}
          {sourceCodeUrl && (
            <ChakraA
              href={sourceCodeUrl} 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source code"
              title="View source code"
              display="block"
            >
              <Flex
                alignItems="center"
                justifyContent="center"
                bg={isDarkMode ? "gray.700" : "gray.200"}
                color={isDarkMode ? "gray.200" : "gray.700"}
                p={2}
                borderRadius="md"
                height="100%"
                aspectRatio="1/1"
                _hover={{ 
                  bg: isDarkMode ? "gray.600" : "gray.300"
                }}
              >
                <Icon as={FaGithub} fontSize="sm" />
              </Flex>
            </ChakraA>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default ItemCard; 