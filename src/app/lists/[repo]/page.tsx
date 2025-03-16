'use client';

import { 
  Box, 
  Heading, 
  Text, 
  Stack, 
  Spinner, 
  Center, 
  Flex, 
  Link, 
  SimpleGrid, 
  Input, 
  IconButton, 
  useDisclosure, 
  Badge, 
  Button
} from '@chakra-ui/react';
import MainLayout from '@/components/MainLayout';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { AwesomeList } from '@/types';
import { 
  FaExternalLinkAlt, 
  FaSearch, 
  FaFilter, 
  FaHeart, 
  FaRegHeart, 
  FaArrowUp, 
  FaBars, 
  FaGithub
} from 'react-icons/fa';
import NextLink from 'next/link';
import { getOwnerForRepo } from '@/utils/repo-mapping';
import { getList } from '@/utils/api';
import { checkSystemReady } from '@/utils/system';
import { useAppContext } from '@/context/AppContext';
import type { ListItem as AwesomeListItem } from '@/types';

// Item type definition with required fields
interface ListItem extends AwesomeListItem {
  category: string; // Ensure category is always a string
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
}

// Table of Contents component props type
interface TableOfContentsProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
  itemsByCategory?: Record<string, ListItem[]>;
}

// ItemCard component props type
interface ItemCardProps {
  item: ListItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

// Table of Contents component
const TableOfContents = ({ 
  categories, 
  activeCategory, 
  onSelectCategory,
  itemsByCategory 
}: TableOfContentsProps) => {
  const { isDarkMode } = useAppContext();
  
  // Function to count items in each category
  const getCategoryCount = (category: string): number => {
    if (!itemsByCategory || !itemsByCategory[category]) return 0;
    return itemsByCategory[category].length;
  };
  
  return (
    <Box 
      position="sticky" 
      top="20px" 
      maxH="calc(100vh - 100px)" 
      overflowY="auto" 
      pr={2}
      borderRadius="md"
      boxShadow="sm"
      bg={isDarkMode ? 'gray.800' : 'white'}
      p={4}
      border="1px solid"
      borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
      }}
    >
      <Heading size="md" mb={4} fontWeight="600" color={isDarkMode ? 'purple.300' : 'purple.700'}>Categories</Heading>
      
      <Button 
        mb={3}
        size="sm"
        width="100%"
        colorScheme="purple"
        variant={activeCategory === null ? "solid" : "outline"}
        onClick={() => onSelectCategory(activeCategory || categories[0])}
      >
        Show All Categories
      </Button>
      
      <Stack gap={1}>
        {categories.map((category) => (
          <Box 
            key={category}
            p={2}
            borderRadius="md"
            cursor="pointer"
            bg={activeCategory === category 
              ? (isDarkMode ? 'purple.900' : 'purple.100') 
              : 'transparent'
            }
            borderLeft={activeCategory === category ? '3px solid' : '3px solid transparent'}
            borderLeftColor={activeCategory === category ? 'brand.secondary.value' : 'transparent'}
            _hover={{ 
              bg: activeCategory === category 
                ? (isDarkMode ? 'purple.900' : 'purple.100') 
                : (isDarkMode ? 'gray.700' : 'gray.100')
            }}
            onClick={() => onSelectCategory(category)}
            transition="all 0.2s"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text 
              fontSize="sm" 
              fontWeight={activeCategory === category ? "600" : "400"}
              color={
                activeCategory === category 
                  ? (isDarkMode ? 'purple.300' : 'purple.700')
                  : (isDarkMode ? 'gray.300' : 'gray.700')
              }
            >
              {category}
            </Text>
            <Badge 
              colorScheme="purple"
              borderRadius="full" 
              fontSize="xs"
            >
              {getCategoryCount(category)}
            </Badge>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// ItemCard component
const ItemCard = ({ item, isFavorite, onToggleFavorite }: ItemCardProps) => {
  const { isDarkMode } = useAppContext();
  
  return (
    <Box
      p={0}
      borderRadius="md"
      overflow="hidden"
      boxShadow="sm"
      border="1px solid"
      borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      height="100%"
      display="flex"
      flexDirection="column"
      bg={isDarkMode ? 'gray.900' : 'white'}
      maxW="100%"
      w="100%"
    >
      <Box w="100%" h="4px" bg="brand.secondary.value" />
      <Box p={3} flex="1">
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Heading as="h3" size="sm" fontWeight="600" color={isDarkMode ? 'white' : 'inherit'} maxW="calc(100% - 40px)" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {item.title}
          </Heading>
          <IconButton
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onToggleFavorite(item.id)}
            size="sm"
            variant="ghost"
            color={isFavorite ? "red.500" : isDarkMode ? "gray.400" : "gray.400"}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </IconButton>
        </Flex>
        
        <Text 
          fontSize="sm" 
          color={isDarkMode ? 'gray.300' : 'gray.600'} 
          mb={2} 
          overflow="hidden" 
          textOverflow="ellipsis" 
          display="-webkit-box" 
          style={{WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}
        >
          {item.description}
        </Text>
        
        <Flex flexWrap="wrap" mb={2} gap={2}>
          {item.license && (
            <Badge colorScheme="purple" variant="subtle" px={2} py={0.5} borderRadius="full" fontSize="xs">
              {item.license}
            </Badge>
          )}
          {item.techStack && (
            <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="full" fontSize="xs">
              {item.techStack}
            </Badge>
          )}
        </Flex>
      </Box>
      
      <Box p={2} bg={isDarkMode ? 'gray.800' : 'gray.50'} borderTop="1px" borderColor={isDarkMode ? 'gray.700' : 'gray.200'}>
        <Flex direction="row" wrap="wrap" gap={1} justifyContent="flex-start">
          <NextLink href={item.url} passHref legacyBehavior>
            <Button 
              as="a" 
              size="xs" 
              colorScheme="purple"
              rel="noopener noreferrer"
              minWidth="auto"
              px={2}
            >
              Visit <Box as={FaExternalLinkAlt} display="inline-block" ml={1} flexShrink={0} />
            </Button>
          </NextLink>
          
          {item.sourceCodeUrl && (
            <NextLink href={item.sourceCodeUrl} passHref legacyBehavior>
              <Button 
                as="a" 
                size="xs" 
                colorScheme="gray" 
                rel="noopener noreferrer"
                minWidth="auto"
                px={2}
              >
                Source <Box as={FaGithub} display="inline-block" ml={1} />
              </Button>
            </NextLink>
          )}
          
          {item.demoUrl && (
            <NextLink href={item.demoUrl} passHref legacyBehavior>
              <Button 
                as="a" 
                size="xs" 
                colorScheme="purple"
                variant="outline" 
                rel="noopener noreferrer"
                minWidth="auto"
                px={2}
              >
                Demo <Box as={FaExternalLinkAlt} display="inline-block" ml={1} />
              </Button>
            </NextLink>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

// Main page component
export default function RepoPage() {
  const { repo } = useParams<{ repo: string }>();
  const { favorites, addToFavorites, removeFromFavorites, isDarkMode } = useAppContext();
  const [list, setList] = useState<AwesomeList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Handle scrolling for the back to top button
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Function to handle category selection
  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Unselect if clicking the same category
    } else {
      setSelectedCategory(category);
      // Scroll to category section on mobile
      if (window.innerWidth < 768) {
        const element = document.getElementById(`category-${category}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Function to toggle favorite status
  const handleToggleFavorite = (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    if (favorites.includes(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };
  
  // Fetch list data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!repo) return;
        
        const isSystemReady = await checkSystemReady();
        if (!isSystemReady) {
          console.error('System is not ready');
          return;
        }
        
        const owner = getOwnerForRepo(repo);
        if (!owner) {
          console.error('No owner found for repo:', repo);
          return;
        }
        
        const listData = await getList(owner, repo);
        if (!listData) {
          console.error('No list data found for:', owner, repo);
          return;
        }
        
        // Use the description extracted by the parser
        setList(listData);
        
        // Convert items to our internal format
        const formattedItems: ListItem[] = listData.items.map((item: any) => ({
          ...item,
          category: item.category || 'Uncategorized'
        }));
        
        setItems(formattedItems);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(formattedItems.map(item => item.category))
        ).sort();
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [repo]);

  if (!list) {
    return (
      <MainLayout>
        <Center minH="50vh">
          <Spinner size="xl" color="purple.500" />
          <Text ml={4}>Loading awesome list...</Text>
        </Center>
      </MainLayout>
    );
  }
  
  // Filter items by search term and selected category
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group items by category for display
  const itemsByCategory = filteredItems.reduce<Record<string, ListItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Organize categories for display
  const categoriesToShow = selectedCategory 
    ? [selectedCategory] 
    : Object.keys(itemsByCategory).sort();
  
  return (
    <MainLayout>
      <Box 
        bgGradient="linear(to-r, brand.primary.value, brand.secondary.value)" 
        color="white" 
        py={8} 
        mb={6}
      >
        <Box maxW="1400px" mx="auto" px={4}>
          <Heading as="h1" size="2xl" mb={3}>
            {list.name}
              </Heading>
          <Text fontSize="lg" maxW="700px">
            {list.description}
          </Text>
          
          <Flex mt={6} gap={4} direction={{ base: "column", md: "row" }}>
            <Box position="relative" maxW={{ base: "100%", md: "400px" }} w="100%">
              <Box 
                position="absolute" 
                left="16px" 
                top="50%" 
                transform="translateY(-50%)" 
                zIndex="1" 
                color="gray.400"
              >
                <FaSearch />
              </Box>
              <Input 
                placeholder="Search resources..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                color={isDarkMode ? "white" : "black"}
                bg={isDarkMode ? "gray.800" : "white"}
                pl={10}
                _placeholder={{ color: isDarkMode ? "gray.400" : "gray.500" }}
              />
            </Box>
            
            <Button 
              display={{ base: "flex", md: "none" }}
              onClick={openDrawer}
              colorScheme="purple"
              variant="outline"
            >
              <Box as={FaBars} display="inline-block" mr={2} /> Browse Categories
            </Button>
          </Flex>
        </Box>
      </Box>
      
      <Box px={4} maxW="1400px" mx="auto" pb={10}>
        <Flex gap={6} position="relative">
          {/* Desktop sidebar */}
          <Box 
            display={{ base: "none", md: "block" }} 
            w="250px" 
            flexShrink={0}
          >
            <TableOfContents 
              categories={categories} 
              activeCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              itemsByCategory={itemsByCategory}
            />
          </Box>
          
          {/* Mobile drawer - simplified */}
          {isDrawerOpen && (
            <Box
              position="fixed"
              top={0}
              left={0}
              w="100%"
              h="100vh"
              zIndex={10}
            >
              <Box 
                position="absolute" 
                top={0} 
                left={0} 
                w="100%" 
                h="100%" 
                bg="blackAlpha.600" 
                onClick={closeDrawer}
              />
              <Box 
                position="relative" 
                bg={isDarkMode ? 'gray.800' : 'white'} 
                w="280px" 
                h="100%" 
                p={4} 
                boxShadow="lg"
              >
                <Flex justify="space-between" mb={4} align="center">
                  <Heading size="md" color={isDarkMode ? 'white' : 'inherit'}>Categories</Heading>
                  <IconButton 
                    aria-label="Close drawer" 
                    onClick={closeDrawer}
                    size="sm"
                    variant="ghost"
                    color={isDarkMode ? 'white' : 'inherit'}
                  >
                    <FaArrowUp style={{ transform: 'rotate(90deg)' }} />
                  </IconButton>
                </Flex>
                <TableOfContents 
                  categories={categories} 
                  activeCategory={selectedCategory}
                  onSelectCategory={(category) => {
                    handleCategorySelect(category);
                    closeDrawer();
                  }}
                  itemsByCategory={itemsByCategory}
                />
              </Box>
            </Box>
          )}
          
          {/* Main content */}
          <Box flex="1" maxW="100%">
            {/* Category selection quicklinks - Only visible on mobile screens */}
            <Box 
              mb={6}
              overflowX="auto"
              pb={2}
              display={{ base: "block", md: "none" }}
              css={{
                '&::-webkit-scrollbar': { height: '6px' },
                '&::-webkit-scrollbar-track': { background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                '&::-webkit-scrollbar-thumb': { background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)', borderRadius: '3px' },
              }}
            >
              <Flex gap={2} minW="max-content">
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant={selectedCategory === null ? "solid" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  borderRadius="full"
                >
                  All Categories
                </Button>
                {categories.map(category => (
                  <Button
                    key={`chip-${category}`}
                    size="sm"
                    colorScheme="purple"
                    variant={selectedCategory === category ? "solid" : "outline"}
                    onClick={() => handleCategorySelect(category)}
                    borderRadius="full"
                  >
                    {category}
                  </Button>
                ))}
              </Flex>
            </Box>

            {/* List items by category */}
            {categoriesToShow.length > 0 ? (
              <Box 
                borderRadius="lg" 
                boxShadow="sm" 
                bg={isDarkMode ? 'gray.800' : 'white'} 
                border="1px solid"
                borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
                height={{ base: "calc(100vh - 240px)", md: "calc(100vh - 180px)" }}
                maxH={{ base: "calc(100vh - 240px)", md: "calc(100vh - 180px)" }}
                maxW="100%"
                overflow="auto"
                position="relative"
                css={{
                  '&::-webkit-scrollbar': { width: '8px' },
                  '&::-webkit-scrollbar-track': { background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                  '&::-webkit-scrollbar-thumb': { background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' },
                }}
              >
                <Box>
                  {categoriesToShow.map((category, index) => (
                    <Box key={category} id={`category-${category}`}>
                      {index > 0 && <Box borderBottom="1px solid" borderColor={isDarkMode ? 'gray.700' : 'gray.100'} />}
                      <Box p={3}>
                        <Flex 
                          align="center" 
                          mb={3}
                          pb={1}
                          borderBottom="1px solid" 
                          borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
                        >
                          <Heading as="h2" size="md" color={isDarkMode ? 'purple.300' : 'purple.700'}>
                            {category}
                          </Heading>
                          <Badge ml={2} colorScheme="purple" borderRadius="full" fontSize="xs" px={2}>
                            {itemsByCategory[category]?.length || 0}
                          </Badge>
                        </Flex>
                        
                        <SimpleGrid 
                          columns={{ base: 1, sm: 1, md: 2, lg: 2, xl: 3 }} 
                          gap={3} 
                          maxW="100%" 
                          overflow="hidden"
                        >
                          {itemsByCategory[category]?.map(item => (
                            <ItemCard 
                              key={item.id}
                              item={item}
                              isFavorite={favorites.includes(item.id)}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </SimpleGrid>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Center p={8} borderRadius="lg" bg={isDarkMode ? 'gray.800' : 'white'} boxShadow="sm" minH="200px" border="1px solid" borderColor={isDarkMode ? 'gray.700' : 'gray.200'}>
                <Flex direction="column" align="center">
                  <Text fontSize="xl" mb={4}>No items match your search criteria.</Text>
                  <Button 
                    colorScheme="purple" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </Flex>
              </Center>
            )}
          </Box>
        </Flex>
        
        {/* Back to top button */}
        <IconButton
          aria-label="Back to top"
          position="fixed"
          bottom="20px"
          right="20px"
          colorScheme="purple"
          size="md"
          borderRadius="full"
          boxShadow="md"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          display={scrollPosition > 300 ? "flex" : "none"}
        >
          <FaArrowUp />
        </IconButton>
      </Box>
    </MainLayout>
  );
} 