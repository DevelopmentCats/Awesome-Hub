// src/utils/lists/core.ts
import { AwesomeList } from '@/types';
import { parseMarkdown } from '../markdown';

/**
 * Core processor for standard awesome lists
 * Uses the universal markdown parser
 */
export function processStandardAwesomeList(markdown: string, owner: string, repo: string): AwesomeList {
  return parseMarkdown(markdown, owner, repo);
}

/**
 * Helper function to clean descriptions (remove trailing periods, normalize whitespace)
 */
export function cleanDescription(description: string): string {
  // Remove trailing periods, normalize whitespace, remove leading dashes
  return description.trim()
    .replace(/^[-–—]/, '')  // Remove leading dash, em dash, or en dash
    .replace(/\.$/, '')     // Remove trailing period
    .replace(/\s+/g, ' ');  // Normalize whitespace
}

/**
 * Helper function to extract title and URL from a markdown link
 */
export function extractMarkdownLink(text: string): { title: string; url: string } | null {
  const linkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (linkMatch) {
    return {
      title: linkMatch[1].trim(),
      url: linkMatch[2].trim()
    };
  }
  return null;
}

/**
 * Helper function to extract description text after a markdown link
 */
export function extractDescription(text: string): string {
  // Remove the markdown link and clean up the remaining text
  const withoutLink = text.replace(/\[([^\]]+)\]\(([^)]+)\)/, '').trim();
  
  // Apply general cleaning
  return cleanDescription(withoutLink);
}