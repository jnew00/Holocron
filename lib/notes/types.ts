/**
 * Note type definitions
 * Extracted from legacy noteManager.ts (File System Access API implementation)
 */

export type NoteType =
  | "note"
  | "todo"
  | "meeting"
  | "scratchpad"
  | "til"
  | "project"
  | "weekly"
  | "book";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  type?: NoteType;
  path?: string; // Filesystem path relative to notes/
}

export interface NoteMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  type?: NoteType;
}
