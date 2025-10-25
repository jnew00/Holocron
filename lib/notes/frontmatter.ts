/**
 * Frontmatter utilities for note metadata management
 * Now with runtime validation via Zod schemas
 */

import matter from "gray-matter";
import {
  validateFrontmatter,
  safeParseFrontmatter,
  type Frontmatter
} from "@/lib/schema/frontmatter";

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
 * With optional validation
 */
export function extractFrontmatter(
  content: string,
  options?: { validate?: boolean }
): {
  data: NoteFrontmatter;
  content: string;
} {
  const { data, content: markdownContent } = matter(content);

  // Validate if requested
  if (options?.validate) {
    const validationResult = safeParseFrontmatter(data);
    if (!validationResult.success) {
      throw new FrontmatterValidationError(
        "Invalid frontmatter structure",
        validationResult.error
      );
    }
    return {
      data: validationResult.data as NoteFrontmatter,
      content: markdownContent,
    };
  }

  return {
    data: data as NoteFrontmatter,
    content: markdownContent,
  };
}

/**
 * Extract and validate frontmatter (always validates)
 */
export function extractAndValidateFrontmatter(content: string): {
  data: Frontmatter;
  content: string;
} {
  const { data, content: markdownContent } = matter(content);
  const validated = validateFrontmatter(data);
  return {
    data: validated,
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

/**
 * Custom error for frontmatter validation failures
 */
export class FrontmatterValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError?: any
  ) {
    super(message);
    this.name = "FrontmatterValidationError";
  }

  /**
   * Get user-friendly error messages
   */
  getMessages(): string[] {
    if (!this.zodError || !this.zodError.errors) {
      return [this.message];
    }
    return this.zodError.errors.map((err: any) => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });
  }
}
