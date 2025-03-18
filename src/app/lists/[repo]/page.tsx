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
  IconButton as ChakraIconButton, 
  Badge, 
  Button
} from '@chakra-ui/react';
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
import { AppLayout } from '@/components/layout';
import { ItemCard, ScrollContainer } from '@/components/ui';

// Custom IconButton component to fix icon prop issue
const IconButton = (props: any) => {
  return <ChakraIconButton {...props} />;
};

// Item type definition with required fields
interface ListItem extends AwesomeListItem {
  category: string; // Ensure category is always a string
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
}

// Extended AwesomeList to include URL property
interface ExtendedAwesomeList extends AwesomeList {
  url?: string;
}

interface CategoryProps {
  name: string;
  items: ListItem[];
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  isDarkMode: boolean;
  listName: string;
  listId: string;
}

// Component to render a category section with its items
const CategorySection = ({ name, items, onToggleFavorite, favorites, isDarkMode, listName, listId }: CategoryProps) => (
  <Box mb={8} id={`category-${name.replace(/\s+/g, '-').toLowerCase()}`}>
    <Flex 
      align="center" 
      mb={4} 
      bg={isDarkMode ? "gray.750" : "gray.50"} 
      p={3} 
      borderRadius="md" 
      position="static"
      boxShadow="sm"
      borderLeft="4px solid"
      borderLeftColor="purple.500"
    >
      <Heading size="md" fontWeight="600">
        {name}
      </Heading>
      <Badge ml={3} colorScheme="purple">{items.length}</Badge>
    </Flex>
    
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
      {items.map(item => (
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
          listName={listName}
          listId={listId}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.includes(item.id)}
          hideCategory={true}
          hideListName={true}
        />
      ))}
    </SimpleGrid>
  </Box>
);

// Category sidebar component
const CategoriesSidebar = ({ 
  categories, 
  activeCategory, 
  onSelectCategory,
  itemsByCategory,
  isDarkMode 
}: {
  categories: string[]; 
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
  itemsByCategory: Record<string, ListItem[]>;
  isDarkMode: boolean;
}) => {
  
  return (
    <ScrollContainer 
      height="calc(100% - 44px)" 
      overflowY="auto" 
      bg={isDarkMode ? "gray.800" : "white"}
      px={2}
      py={2}
    >
      <Stack gap={1}>
        {categories.map(category => (
          <Button
            key={category}
            size="sm" 
            variant={activeCategory === category ? "solid" : "ghost"}
            colorScheme={activeCategory === category ? "purple" : "gray"}
            justifyContent="space-between"
            onClick={() => onSelectCategory(category)}
            width="100%"
            textAlign="left"
            fontWeight={activeCategory === category ? "semibold" : "normal"}
            fontSize="sm"
            borderRadius="md"
            height="auto"
            px={3}
            py={2}
          >
            <Text 
              overflow="hidden" 
              textOverflow="ellipsis" 
              whiteSpace="nowrap"
            >
              {category}
            </Text>
            <Badge colorScheme={activeCategory === category ? "purple" : "gray"}>
              {itemsByCategory[category]?.length || 0}
            </Badge>
          </Button>
        ))}
      </Stack>
    </ScrollContainer>
  );
};

export default function RepoPage() {
  const params = useParams();
  const repo = Array.isArray(params.repo) ? params.repo[0] : params.repo;
  const owner = getOwnerForRepo(repo);
  
  const { isDarkMode, favorites, addToFavorites, removeFromFavorites, setCurrentSection } = useAppContext();
  
  const [list, setList] = useState<ExtendedAwesomeList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ListItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, ListItem[]>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [visibleCategory, setVisibleCategory] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Set current section for contextual sidebar
  useEffect(() => {
    setCurrentSection('list');
  }, [setCurrentSection]);

  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };
  
  // Handle category select
  const handleCategorySelect = (category: string) => {
    // Scroll to category section
    const element = document.getElementById(`category-${category.replace(/\s+/g, '-').toLowerCase()}`);
    if (element && contentRef.current) {
      contentRef.current.scrollTo({
        top: element.offsetTop - 16,
        behavior: 'smooth'
      });
    }
    
    setActiveCategory(category === activeCategory ? null : category);
    closeDrawer();
  };
  
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  
  // Track scroll position to show/hide scroll to top button
  useEffect(() => {
    const handleContentScroll = () => {
      if (contentRef.current) {
        setShowScrollToTop(contentRef.current.scrollTop > 300);
        
        // Find current visible category
        const categoryElements = document.querySelectorAll('[id^="category-"]');
        let currentCategory = null;
        
        categoryElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Check if element is in view (with some buffer)
          if (rect.top <= 200 && rect.bottom >= 0) {
            // Extract category name from id
            const categoryId = el.id.replace('category-', '');
            currentCategory = categories.find(cat => 
              cat.replace(/\s+/g, '-').toLowerCase() === categoryId
            );
          }
        });
        
        setVisibleCategory(currentCategory);
      }
    };
    
    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener('scroll', handleContentScroll);
    }
    
    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('scroll', handleContentScroll);
      }
    };
  }, [categories]);
  
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Set the first category as default visible category when categories load
  useEffect(() => {
    if (categories.length > 0 && !visibleCategory) {
      setVisibleCategory(categories[0]);
    }
  }, [categories, visibleCategory]);
  
  // Initial data load
  useEffect(() => {
    const systemReady = checkSystemReady();
    
    const fetchData = async () => {
      if (!systemReady || !repo) {
        setLoading(false);
        return;
      }
        
      try {
        setLoading(true);
        const repoOwner = getOwnerForRepo(repo);
        
        if (!repoOwner) {
          console.error(`No owner found for repo: ${repo}`);
          setLoading(false);
          return;
        }
        
        const listData = await getList(repoOwner, repo);
        
        if (listData) {
          setList(listData as ExtendedAwesomeList);
        
          if (listData.items && Array.isArray(listData.items)) {
            // Get unique categories and sort them
            const uniqueCategories = Array.from(new Set(
              listData.items
                .filter(item => item.category) // Filter out items without a category
                .map(item => item.category)
            )).filter(cat => cat !== undefined) as string[];
        
            setCategories(uniqueCategories);
            
            // Group items by category
            const groupedItems = listData.items.reduce((acc, item) => {
              if (item.category) {
                if (!acc[item.category]) {
                  acc[item.category] = [];
                }
                acc[item.category].push(item as ListItem);
              }
              return acc;
            }, {} as Record<string, ListItem[]>);
            
            setItemsByCategory(groupedItems);
            setItems(listData.items as ListItem[]);
            setFilteredItems(listData.items as ListItem[]);
          }
        }
      } catch (error) {
        console.error('Error fetching list data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [repo]);
  
  // Filter items when search query changes
  useEffect(() => {
    if (items.length > 0) {
      let filtered = items;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
        );
        
        setFilteredItems(filtered);
        
        // Update itemsByCategory for the filtered items
        const filteredGroupedItems = filtered.reduce((acc, item) => {
          if (item.category) {
            if (!acc[item.category]) {
              acc[item.category] = [];
            }
            acc[item.category].push(item);
          }
          return acc;
        }, {} as Record<string, ListItem[]>);
        
        setItemsByCategory(filteredGroupedItems);
        
        // Update categories based on what's available after filtering
        setCategories(Object.keys(filteredGroupedItems).sort());
      } else {
        // If no search query, restore original grouping
        const groupedItems = items.reduce((acc, item) => {
          if (item.category) {
            if (!acc[item.category]) {
              acc[item.category] = [];
            }
            acc[item.category].push(item);
          }
          return acc;
        }, {} as Record<string, ListItem[]>);
        
        setItemsByCategory(groupedItems);
        setFilteredItems(items);
        
        // Restore original categories order
        const uniqueCategories = Array.from(new Set(
          items
            .filter(item => item.category)
            .map(item => item.category)
        )).filter(cat => cat !== undefined) as string[];
        
        setCategories(uniqueCategories);
      }
    }
  }, [searchQuery, items]);
  
  return (
    <AppLayout disableScrollContainer={true}>
      <Box 
        width="100%" 
        height="100%" 
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        {loading ? (
          <Center py={10} height="100%">
            <Spinner size="xl" color="purple.500" />
          </Center>
        ) : (
          <>
            {/* Fixed Header */}
            <Box
              borderBottom="1px"
              borderColor={isDarkMode ? "gray.700" : "gray.200"}
              py={3}
              px={4}
              bg={isDarkMode ? "gray.800" : "white"}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Flex direction="row" align="start" maxW="60%" mr={3}>
                  <Heading as="h1" size="md" mr={3} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {list?.name || repo}
                  </Heading>
                  <Text 
                    color={isDarkMode ? "gray.400" : "gray.600"} 
                    fontSize="sm"
                    maxW={{ base: "150px", md: "300px", lg: "500px" }}
                  >
                    {list?.description || 'No description available'}
                  </Text>
                </Flex>
                
                <Flex align="center" gap={3}>
                  <Box position="relative" width={{ base: "180px", md: "250px" }}>
                    <Box 
                      position="absolute" 
                      left="12px" 
                      top="50%" 
                      transform="translateY(-50%)" 
                      zIndex="1" 
                      color="gray.400"
                    >
                      <FaSearch size={12} />
                    </Box>
                    <Input 
                      placeholder="Search in this list..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      paddingLeft="32px"
                      size="sm"
                      bg={isDarkMode ? "gray.700" : "white"}
                      borderColor={isDarkMode ? "gray.600" : "gray.200"}
                      _hover={{
                        borderColor: isDarkMode ? "gray.500" : "gray.300"
                      }}
                      _focus={{
                        borderColor: "purple.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)"
                      }}
                    />
                  </Box>
                  
                  <IconButton
                    aria-label="Show category filter"
                    icon={<FaFilter />}
                    onClick={openDrawer}
                    display={{ base: 'flex', md: 'none' }}
                    size="sm"
                  />
                  
                  {list && list.url && (
                    <Link 
                      href={list.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      display="inline-flex"
                      alignItems="center"
                      px={3}
                      py={1.5}
                      bg={isDarkMode ? "gray.700" : "gray.100"}
                      color={isDarkMode ? "gray.200" : "gray.800"}
                      fontWeight="500"
                      fontSize="sm"
                      borderRadius="md"
                      _hover={{
                        bg: isDarkMode ? "gray.600" : "gray.200",
                        textDecoration: "none"
                      }}
                    >
                      <FaGithub style={{ marginRight: '6px' }} />
                      GitHub
                    </Link>
                  )}
                </Flex>
              </Flex>
            </Box>
            
            {/* Main Content Area with Two Scrollable Containers */}
            <Flex 
              flex="1" 
              overflow="hidden" 
            >
              {/* Categories Sidebar - Desktop */}
              <Box 
                width="240px" 
                borderRight="1px"
                borderColor={isDarkMode ? "gray.700" : "gray.200"}
                height="100%"
                display={{ base: 'none', md: 'block' }}
                overflow="hidden"
                flexShrink={0}
              >
                <Box 
                  p={3} 
                  borderBottom="1px" 
                  borderColor={isDarkMode ? "gray.700" : "gray.200"}
                >
                  <Heading size="sm" fontWeight="600">
                    Categories ({categories.length})
                  </Heading>
                </Box>
                <CategoriesSidebar 
                  categories={categories} 
                  activeCategory={activeCategory} 
                  onSelectCategory={handleCategorySelect}
                  itemsByCategory={itemsByCategory}
                  isDarkMode={isDarkMode}
                />
              </Box>
              
              {/* Mobile Category Drawer */}
              {isDrawerOpen && (
                <Box 
                  position="fixed"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bg="rgba(0, 0, 0, 0.5)"
                  zIndex="overlay"
                  onClick={closeDrawer}
                >
                  <Box 
                    position="fixed"
                    top="0"
                    left="0"
                    bottom="0"
                    width="80%"
                    maxWidth="300px"
                    bg={isDarkMode ? "gray.800" : "white"}
                    boxShadow="lg"
                    zIndex="modal"
                    overflow="auto"
                    p={4}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Categories</Heading>
                      <IconButton 
                        aria-label="Close drawer" 
                        icon={<FaBars />} 
                        onClick={closeDrawer}
                        variant="ghost"
                      />
                    </Flex>
                    <CategoriesSidebar 
                      categories={categories} 
                      activeCategory={activeCategory} 
                      onSelectCategory={handleCategorySelect}
                      itemsByCategory={itemsByCategory}
                      isDarkMode={isDarkMode}
                    />
                  </Box>
                </Box>
              )}
              
              {/* Content Area Container */}
              <Box
                flex="1"
                height="100%"
                borderRadius="md"
                boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.15)"
                border="1px solid"
                borderColor={isDarkMode ? "gray.700" : "gray.200"}
                bg={isDarkMode ? "gray.800" : "white"}
                overflow="hidden"
                display="flex"
                flexDirection="column"
              >
                {/* Fixed Category Header */}
                <Box 
                  p={3} 
                  borderBottom="1px" 
                  borderColor={isDarkMode ? "gray.700" : "gray.200"}
                  bg={isDarkMode ? "gray.750" : "gray.50"}
                >
                  <Flex align="center">
                    <Heading size="sm" fontWeight="600" color="purple.500">
                      {visibleCategory || (categories.length > 0 ? categories[0] : 'Categories')}
                    </Heading>
                    {visibleCategory && itemsByCategory[visibleCategory] && (
                      <Badge ml={2} colorScheme="purple" fontSize="xs">
                        {itemsByCategory[visibleCategory].length} items
                      </Badge>
                    )}
                    {!visibleCategory && categories.length > 0 && itemsByCategory[categories[0]] && (
                      <Badge ml={2} colorScheme="purple" fontSize="xs">
                        {itemsByCategory[categories[0]].length} items
                      </Badge>
                    )}
                  </Flex>
                </Box>
                
                {/* Scrollable Content */}
                <Box
                  flex="1"
                  p={4}
                  overflowY="auto"
                  height="100%"
                  ref={contentRef}
                >
                  {filteredItems.length > 0 ? (
                    <Box>
                      {/* Group Items by Category */}
                      {categories.map(category => (
                        itemsByCategory[category] && itemsByCategory[category].length > 0 && (
                          <CategorySection 
                            key={category}
                            name={category}
                            items={itemsByCategory[category]}
                            onToggleFavorite={handleToggleFavorite}
                            favorites={favorites}
                            isDarkMode={isDarkMode}
                            listName={list?.name || repo}
                            listId={list?.id || ''}
                          />
                        )
                      ))}
                    </Box>
                  ) : (
                    <Box 
                      p={6} 
                      textAlign="center"
                      bg={isDarkMode ? "gray.750" : "gray.50"}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={isDarkMode ? "gray.700" : "gray.200"}
                    >
                      <Text mb={4}>No items found matching your criteria.</Text>
                      {searchQuery && (
                        <Button 
                          onClick={() => setSearchQuery('')} 
                          size="sm"
                          colorScheme="purple"
                          variant="outline"
                        >
                          Clear search
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Flex>
            
            {/* Scroll to Top Button */}
            {showScrollToTop && (
              <IconButton
                aria-label="Scroll to top"
                icon={<FaArrowUp />}
                size="md"
                colorScheme="purple"
                position="fixed"
                bottom="24px"
                right="24px"
                borderRadius="full"
                onClick={scrollToTop}
                boxShadow="lg"
                zIndex="docked"
              />
            )}
          </>
        )}
      </Box>
    </AppLayout>
  );
} 