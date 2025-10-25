/**
 * Frontmatter utilities for note metadata management
 */

import matter from "gray-matter";

export interface NoteFrontmatter {
  type?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * Add or update frontmatter in markdown content
 */
export function addFrontmatter(
  content: string,
  frontmatter: NoteFrontmatter
): string {
  const { data: existingData, content: markdownContent } = matter(content);

  // Merge existing frontmatter with new values
  const mergedData = {
    ...existingData,
    ...frontmatter,
  };

  // Stringify back to markdown with frontmatter
  return matter.stringify(markdownContent, mergedData);
}

/**
 * Extract frontmatter from markdown content
 */
export function extractFrontmatter(content: string): {
  data: NoteFrontmatter;
  content: string;
} {
  const { data, content: markdownContent } = matter(content);
  return {
    data: data as NoteFrontmatter,
    content: markdownContent,
  };
}

/**
 * Update only the markdown content, preserving frontmatter
 */
export function updateContent(
  originalContent: string,
  newMarkdownContent: string
): string {
  const { data } = matter(originalContent);
  return matter.stringify(newMarkdownContent, data);
}
