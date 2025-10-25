/**
 * Zod schemas for note frontmatter validation
 * Provides runtime type safety for YAML parsing
 */

import { z } from "zod";

/**
 * Valid note types (discriminated union)
 */
export const NoteTypeSchema = z.enum([
  "note",
  "todo",
  "meeting",
  "scratchpad",
  "til",
  "project",
  "weekly",
  "book",
]);

/**
 * Core frontmatter schema
 * All fields optional except those explicitly required
 */
export const FrontmatterSchema = z.object({
  // Note type with discriminated union
  type: NoteTypeSchema.optional(),

  // Tags for categorization
  tags: z.array(z.string()).optional(),

  // Timestamps (ISO 8601 strings)
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  // Archival status
  archived: z.boolean().optional(),

  // Custom metadata (allows additional fields)
}).passthrough(); // Allow additional fields not in schema

/**
 * Type-specific frontmatter schemas
 * Each note type can have additional fields
 */

// Meeting notes schema
export const MeetingFrontmatterSchema = FrontmatterSchema.extend({
  type: z.literal("meeting"),
  attendees: z.array(z.string()).optional(),
  location: z.string().optional(),
  date: z.string().datetime().optional(),
});

// Todo notes schema
export const TodoFrontmatterSchema = FrontmatterSchema.extend({
  type: z.literal("todo"),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().datetime().optional(),
});

// Project notes schema
export const ProjectFrontmatterSchema = FrontmatterSchema.extend({
  type: z.literal("project"),
  status: z.enum(["planning", "active", "on-hold", "completed", "archived"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Book notes schema
export const BookFrontmatterSchema = FrontmatterSchema.extend({
  type: z.literal("book"),
  author: z.string().optional(),
  isbn: z.string().optional(),
  publishedYear: z.number().optional(),
  rating: z.number().min(1).max(5).optional(),
});

/**
 * Discriminated union of all note type schemas
 * Validates based on the 'type' field
 */
export const TypedFrontmatterSchema = z.discriminatedUnion("type", [
  MeetingFrontmatterSchema,
  TodoFrontmatterSchema,
  ProjectFrontmatterSchema,
  BookFrontmatterSchema,
]);

/**
 * Validate frontmatter data
 * Returns parsed data or throws validation error
 */
export function validateFrontmatter(data: unknown): z.infer<typeof FrontmatterSchema> {
  return FrontmatterSchema.parse(data);
}

/**
 * Safe validation that returns error instead of throwing
 */
export function safeParseFrontmatter(data: unknown): {
  success: boolean;
  data?: z.infer<typeof FrontmatterSchema>;
  error?: z.ZodError;
} {
  const result = FrontmatterSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate typed frontmatter (with discriminated unions)
 * Only validates if a 'type' field is present
 */
export function validateTypedFrontmatter(data: unknown) {
  // If no type field, use basic schema
  if (typeof data === "object" && data !== null && !("type" in data)) {
    return FrontmatterSchema.parse(data);
  }

  // Try typed schema first
  const typedResult = TypedFrontmatterSchema.safeParse(data);
  if (typedResult.success) {
    return typedResult.data;
  }

  // Fall back to basic schema if typed validation fails
  return FrontmatterSchema.parse(data);
}

// Export TypeScript types inferred from schemas
export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type NoteType = z.infer<typeof NoteTypeSchema>;
export type MeetingFrontmatter = z.infer<typeof MeetingFrontmatterSchema>;
export type TodoFrontmatter = z.infer<typeof TodoFrontmatterSchema>;
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;
export type BookFrontmatter = z.infer<typeof BookFrontmatterSchema>;
