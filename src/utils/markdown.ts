import { marked } from 'marked';
import type { Token, Tokens } from 'marked';
import crypto from 'crypto';
import type { TrackedRepository } from '@/types';

interface ListItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category?: string;
  subcategory?: string;
  firstSeen: string;
  isNew: boolean;
  demoUrl?: string;
  sourceCodeUrl?: string;
  license?: string;
  techStack?: string;
}

interface AwesomeList {
  id: string;
  name: string;
  description: string;
  owner: string;
  repo: string;
  items: ListItem[];
  categories: string[];
  subcategories: Record<string, string[]>;
  lastUpdated: string;
}

/**
 * Generate a unique ID for a list item based on its content
 */
export function generateItemId(title: string, url: string): string {
  const content = `${title}|${url}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Extract categories from the Table of Contents
 */
function extractTOCCategories(tokens: Token[]): string[] {
  const categories: string[] = [];
  let inTOC = false;
  
  // Find the table of contents section
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Look for headings like "Contents" or "Table of Contents"
    if (token.type === 'heading' && 'text' in token && 
        (token.text.includes('Contents') || token.text.includes('Table of Contents'))) {
      inTOC = true;
      continue;
    }
    
    // Stop when we hit another heading after TOC that's not Software
    if (inTOC && token.type === 'heading' && 'depth' in token) {
      const heading = token as Tokens.Heading;
      if (heading.depth <= 2 && !('text' in token && token.text === 'Software')) {
        inTOC = false;
        break;
      }
    }
    
    // Process list items in TOC to extract categories
    if (inTOC && token.type === 'list' && 'items' in token) {
      const listToken = token as Tokens.List;
      
      for (const item of listToken.items) {
        if ('text' in item && item.text.includes('](')) {
          const linkMatch = item.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            const category = linkMatch[1].trim();
            
            // Skip common non-category sections
            const nonCategorySections = [
              'Table of Contents', 'Contents', 'License', 'Licenses', 
              'Contributing', 'Contribute', 'About', 'Anti-features', 
              'External Links', 'Resources', 'List of Licenses', 'Software',
              'Hardware'
            ];
            
            if (!nonCategorySections.some(section => 
                category === section || 
                category === 'List of Licenses' ||
                category.startsWith('Awesome'))) {
              categories.push(category);
            }
          }
        }
        
        // Also check for nested list items (for nested TOCs)
        if ('items' in item && Array.isArray(item.items)) {
          for (const subItem of item.items) {
            if ('text' in subItem && subItem.text.includes('](')) {
              const linkMatch = subItem.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
              if (linkMatch) {
                const category = linkMatch[1].trim();
                
                // Skip common non-category sections
                const nonCategorySections = [
                  'Table of Contents', 'Contents', 'License', 'Licenses', 
                  'Contributing', 'Contribute', 'About', 'Anti-features', 
                  'External Links', 'Resources', 'List of Licenses'
                ];
                
                if (!nonCategorySections.some(section => 
                    category === section || 
                    category === 'List of Licenses' ||
                    category.startsWith('Awesome'))) {
                  categories.push(category);
                }
              }
            }
          }
        }
      }
    }
  }

  // If no categories found through TOC, try secondary approach
  if (categories.length === 0) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading' && 'depth' in token && token.depth === 2 && 'text' in token) {
        const headingText = token.text;
        
        // Skip known non-categories
        const nonCategorySections = [
          'Table of Contents', 'Contents', 'License', 'Licenses', 
          'Contributing', 'Contribute', 'About', 'Anti-features', 
          'List of Licenses', 'External Links', 'Resources'
        ];
        
        const isNonCategory = nonCategorySections.some(section => 
          headingText === section || 
          headingText.startsWith('Awesome'));
          
        // Check if this heading is followed by resource lists
        if (!isNonCategory && isFollowedByListItems(tokens, i)) {
          categories.push(headingText);
        }
      }
    }
  }
  
  return categories;
}

/**
 * Check if a heading is followed by list items with links (actual resources)
 */
function isFollowedByListItems(tokens: Token[], headingIndex: number): boolean {
  for (let i = headingIndex + 1; i < tokens.length; i++) {
    // If we hit another heading, return false
    if (tokens[i].type === 'heading' && 'depth' in tokens[i]) {
      const heading = tokens[i] as Tokens.Heading;
      if (heading.depth <= 2) {
        return false;
      }
    }
    
    // If we find a list with link items, return true
    if (tokens[i].type === 'list' && 'items' in tokens[i]) {
      const listToken = tokens[i] as Tokens.List;
      
      // Check if any list item contains a link
      for (const item of listToken.items) {
        if ('text' in item && item.text && item.text.includes('](')) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Clean description text
 */
function cleanDescription(description: string): string {
  return description
    .trim()
    .replace(/^[-–—]/, '') // Remove leading dash
    .replace(/\.$/, '')    // Remove trailing period
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Extract description text after a markdown link
 */
function extractDescriptionFromItem(text: string): string {
  // Remove the markdown link and clean up
  return cleanDescription(
    text.replace(/\[([^\]]+)\]\(([^)]+)\)/, '').trim()
  );
}

/**
 * Extract the main description from the README text
 * This is specifically designed to handle common layouts of awesome lists
 */
function extractMainDescription(tokens: Token[]): string {
  // Look for the description paragraph after the title and badges
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Look for a top-level heading (H1)
    if (token.type === 'heading' && 'depth' in token && token.depth === 1) {
      // After finding the title, look for the first substantial paragraph
      // Skip lines that are just badges or short phrases
      for (let j = i + 1; j < tokens.length && j < i + 10; j++) {
        if (tokens[j].type === 'paragraph' && 'text' in tokens[j]) {
          const paragraphToken = tokens[j] as Tokens.Paragraph;
          const text = paragraphToken.text;
          
          // Skip short texts or texts that are just badge links
          if (text.length > 100 && !text.match(/^\s*\[!\[.*?\]\(.*?\)\]\(.*?\)\s*$/)) {
            // Clean the description text - remove Markdown links but keep their text
            return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
          }
        } else if (tokens[j].type === 'heading' && 'depth' in tokens[j]) {
          const headingToken = tokens[j] as Tokens.Heading;
          if (headingToken.depth <= 2) {
            // If we hit another main heading, stop looking
            break;
          }
        }
      }
    }
  }
  
  // Fallback: Look for any paragraph in the first few tokens
  for (let i = 0; i < Math.min(tokens.length, 15); i++) {
    if (tokens[i].type === 'paragraph' && 'text' in tokens[i]) {
      const paragraphToken = tokens[i] as Tokens.Paragraph;
      const text = paragraphToken.text;
      if (text.length > 80) {
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
      }
    }
  }
  
  return '';
}

/**
 * Extract special links and metadata from description text
 */
function extractMetadata(description: string): { 
  cleanDescription: string, 
  demoUrl?: string, 
  sourceCodeUrl?: string, 
  license?: string,
  techStack?: string
} {
  let cleanDescription = description;
  let demoUrl: string | undefined;
  let sourceCodeUrl: string | undefined;
  let license: string | undefined;
  let techStack: string | undefined;
  
  // Extract Demo link
  const demoMatch = description.match(/\[Demo\]\(([^)]+)\)/);
  if (demoMatch) {
    demoUrl = demoMatch[1];
    cleanDescription = cleanDescription.replace(demoMatch[0], '');
  }
  
  // Extract Source Code link
  const sourceMatch = description.match(/\[Source Code\]\(([^)]+)\)/);
  if (sourceMatch) {
    sourceCodeUrl = sourceMatch[1];
    cleanDescription = cleanDescription.replace(sourceMatch[0], '');
  }
  
  // Extract license - typically in backticks at the end
  const licenseMatch = description.match(/`([^`]+)`/);
  if (licenseMatch) {
    license = licenseMatch[1];
    cleanDescription = cleanDescription.replace(licenseMatch[0], '');
  }
  
  // Extract tech stack - typically after the license
  const techStackMatch = description.match(/`[^`]+`\s+`([^`]+)`/);
  if (techStackMatch) {
    techStack = techStackMatch[1];
    // We've already removed the license part above, just remove the tech stack part
    cleanDescription = cleanDescription.replace(/`([^`]+)`/, '');
  }
  
  // Clean up any leftover parentheses, commas, etc.
  cleanDescription = cleanDescription
    .replace(/\(\s*,?\s*\)/g, '')
    .replace(/\s+,\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    cleanDescription,
    demoUrl,
    sourceCodeUrl,
    license,
    techStack
  };
}

/**
 * Parse markdown content into structured data using a universal approach
 */
export function parseMarkdown(markdown: string, owner: string, repo: string, repoConfig?: TrackedRepository): AwesomeList {
  const tokens = marked.lexer(markdown);
  const items: ListItem[] = [];
  const categories: string[] = [];
  const subcategories: Record<string, string[]> = {};
  
  // Step 1: Extract valid categories from Table of Contents
  const validCategories = extractTOCCategories(tokens);
  
  let currentCategory: string | undefined;
  let currentSubcategory: string | undefined;
  
  // Use the name from repoConfig if provided, otherwise extract from markdown
  let listName = repoConfig?.name || repo;
  
  // Find the main description and list name (usually in the first paragraph after title)
  let description = extractMainDescription(tokens);
  
  // Find the title (H1) if we need to extract the name from markdown
  if (!repoConfig?.name) {
    for (let i = 0; i < Math.min(tokens.length, 5); i++) {
      const token = tokens[i];
      if (token.type === 'heading' && 'depth' in token && token.depth === 1 && 'text' in token) {
        // Extract list name from title
        const titleText = token.text;
        if (titleText.includes('Awesome')) {
          // Parse out just the name part
          listName = titleText.replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
          if (listName.toLowerCase().startsWith('awesome')) {
            listName = listName.substring('awesome'.length).trim();
          }
          if (!listName) listName = repo; // Fallback
        }
        break; // Found the title, no need to continue this loop
      }
    }
  }
  
  // Step 2: Process categories and items
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'heading' && 'depth' in token && 'text' in token) {
      const headingText = token.text;
      const headingDepth = token.depth;
      
      if (headingDepth === 2) {
        // For awesome-selfhosted, many categories are under the "Software" section
        const isSoftwareSection = headingText === 'Software';
        
        // A section is a valid category if:
        // 1. It's in our list of TOC-extracted categories, OR
        // 2. It's followed by list items with links (implying resources)
        // AND
        // 3. It's not in our list of known non-category sections
        
        const nonCategoryKeywords = [
          'Table of Contents', 'Contents', 'License', 'Licenses', 
          'Contributing', 'Contribute', 'About', 'Anti-features', 
          'List of Licenses', 'External Links', 'Resources'
        ];
        
        const isNonCategory = nonCategoryKeywords.some(section => 
          headingText === section || 
          headingText.startsWith('Awesome')
        );
        
        if (!isNonCategory && 
            (validCategories.includes(headingText) || isFollowedByListItems(tokens, i))) {
        currentCategory = headingText;
        currentSubcategory = undefined;
        
        if (currentCategory && !categories.includes(currentCategory)) {
          categories.push(currentCategory);
          subcategories[currentCategory] = [];
          }
        } else if (isSoftwareSection) {
          // Special handling for "Software" section - don't set as category but don't clear current category either
          // This allows categories nested under Software to work correctly
        } else {
          // Not a valid category
          currentCategory = undefined;
          currentSubcategory = undefined;
        }
      } else if (headingDepth === 3) {
        // For H3 headings, check if they're a category from our valid categories list
        // This handles cases like awesome-selfhosted where actual categories are H3s under "Software"
        if (validCategories.includes(headingText)) {
          currentCategory = headingText;
          currentSubcategory = undefined;
          
          if (currentCategory && !categories.includes(currentCategory)) {
            categories.push(currentCategory);
            subcategories[currentCategory] = [];
          }
        } else if (currentCategory) {
          // Regular subcategory under a valid category
        currentSubcategory = headingText;
        
        if (currentCategory && currentSubcategory && 
            !subcategories[currentCategory].includes(currentSubcategory)) {
          subcategories[currentCategory].push(currentSubcategory);
        }
      }
      }
    } else if (token.type === 'list' && 'items' in token && currentCategory) {
      // Process list items only if we're in a valid category
      const listToken = token as Tokens.List;
      
      for (const item of listToken.items) {
        if ('text' in item && item.text) {
          const linkMatches = item.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
          
          if (linkMatches) {
            const title = linkMatches[1];
            const url = linkMatches[2];
            
            // Skip non-content items like License, Contributing, etc.
            const nonContentTitles = [
              'License', 'Contributing', 'External Links', 
              'Anti-features', 'List of Licenses', 'Software'
            ];
            
            // Skip TOC items and meta items
            if (nonContentTitles.includes(title) || url.startsWith('#')) {
              continue;
            }
            
            const descriptionText = extractDescriptionFromItem(item.text);
            
            // Extract metadata from description
            const { 
              cleanDescription, 
              demoUrl, 
              sourceCodeUrl, 
              license,
              techStack 
            } = extractMetadata(descriptionText);
            
            const listItem: ListItem = {
              id: generateItemId(title, url),
              title,
              description: cleanDescription,
              url,
              category: currentCategory,
              subcategory: currentSubcategory,
              firstSeen: new Date().toISOString(),
              isNew: true,
              demoUrl,
              sourceCodeUrl,
              license,
              techStack
            };
            
            items.push(listItem);
          }
        }
      }
    }
  }
  
  // Step 3: Special handling for repositories like awesome-selfhosted
  // If we only have generic categories like "Software" but items have subcategories
  // like "Analytics", "Monitoring", etc., use those as main categories
  const uniqueSubcategories = new Set<string>();
  
  // Collect all unique subcategories
  items.forEach(item => {
    if (item.subcategory && item.category === 'Software') {
      uniqueSubcategories.add(item.subcategory);
    }
  });
  
  // If we have subcategories and not many main categories, use subcategories as categories
  const nonTocCategories = categories.filter(c => c !== 'Table of contents' && c !== 'Software');
  
  if (uniqueSubcategories.size > 0 && nonTocCategories.length < 5) {
    // Use subcategories as main categories
    const newCategories = Array.from(uniqueSubcategories);
    const newSubcategories: Record<string, string[]> = {};
    
    // Initialize subcategories for each new category
    newCategories.forEach(category => {
      newSubcategories[category] = [];
    });
    
    // Update the items to use the subcategory as the main category
    const updatedItems = items.map(item => {
      if (item.subcategory && item.category === 'Software') {
        return {
          ...item,
          category: item.subcategory,
          subcategory: undefined
        };
      }
      return item;
    });
    
    return {
      id: `${owner}/${repo}`,
      name: listName,
      description,
      owner,
      repo,
      items: updatedItems,
      categories: newCategories,
      subcategories: newSubcategories,
      lastUpdated: new Date().toISOString()
    };
  }
  
  return {
    id: `${owner}/${repo}`,
    name: listName,
    description,
    owner,
    repo,
    items,
    categories,
    subcategories,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Compare two list versions and identify new items
 */
export function compareListVersions(
  previousList: AwesomeList | null, 
  currentList: AwesomeList,
  newItemDuration = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
): AwesomeList {
  // If no previous list exists, this is a first-time scrape
  if (!previousList) {
    // For first-time scrapes, mark all items as not new
    const initialItems = currentList.items.map(item => ({
      ...item,
      firstSeen: new Date().toISOString(),
      isNew: false // Mark all items as not new on first scrape
    }));
    
    return {
      ...currentList,
      items: initialItems,
      lastUpdated: new Date().toISOString()
    };
  }
  
  const now = new Date();
  const updatedItems = currentList.items.map(item => {
    const existingItem = previousList.items.find(prevItem => prevItem.id === item.id);
    
    if (existingItem) {
      // Item exists in previous list, preserve its firstSeen date
      const firstSeen = existingItem.firstSeen;
      const firstSeenDate = new Date(firstSeen);
      const isNew = now.getTime() - firstSeenDate.getTime() < newItemDuration;
      
      return {
        ...item,
        firstSeen,
        isNew
      };
    }
    
    // This is a new item that wasn't in the previous list
    return {
      ...item,
      firstSeen: now.toISOString(),
      isNew: true
    };
  });
  
  return {
    ...currentList,
    items: updatedItems,
    lastUpdated: now.toISOString()
  };
}