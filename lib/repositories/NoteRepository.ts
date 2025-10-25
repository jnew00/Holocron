/**
 * Note Repository
 * Centralized data access layer for note operations
 */

import { BaseRepository, RepositoryError } from "./base";
import { Note, NoteMetadata } from "@/lib/notes/types";

export interface NoteListItem {
  path: string;
  name: string;
  updatedAt: string;
}

export interface WriteNoteParams {
  notePath: string;
  content: string;
  metadata?: {
    title?: string;
    type?: string;
    tags?: string[];
  };
}

/**
 * Repository for note CRUD operations
 */
export class NoteRepository extends BaseRepository {
  constructor(private readonly repoPath: string) {
    super();
  }

  /**
   * List all notes in the repository
   */
  async list(): Promise<NoteListItem[]> {
    const url = this.buildUrl("/api/notes/list", {
      repoPath: this.repoPath,
    });

    try {
      const response = await this.get<{ notes: NoteListItem[] }>(url);
      return response.notes;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to list notes", "LIST_FAILED", undefined, error);
    }
  }

  /**
   * Read a specific note
   */
  async read(notePath: string): Promise<{ content: string; metadata?: any; modified: string }> {
    const url = this.buildUrl("/api/notes/read", {
      repoPath: this.repoPath,
      notePath,
    });

    try {
      return await this.get(url);
    } catch (error) {
      if (error instanceof RepositoryError) {
        // Check for not found
        if (error.statusCode === 404) {
          throw new RepositoryError(
            `Note not found: ${notePath}`,
            "NOT_FOUND",
            404,
            error.details
          );
        }
        throw error;
      }
      throw new RepositoryError(
        `Failed to read note: ${notePath}`,
        "READ_FAILED",
        undefined,
        error
      );
    }
  }

  /**
   * Write (create or update) a note
   */
  async write(params: WriteNoteParams): Promise<{ success: boolean; message: string }> {
    try {
      return await this.post("/api/notes/write", {
        repoPath: this.repoPath,
        ...params,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        `Failed to write note: ${params.notePath}`,
        "WRITE_FAILED",
        undefined,
        error
      );
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(notePath: string): Promise<{ success: boolean; message: string }> {
    const url = this.buildUrl("/api/notes/delete", {
      repoPath: this.repoPath,
      notePath,
    });

    try {
      return await this.delete(url);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        `Failed to delete note: ${notePath}`,
        "DELETE_FAILED",
        undefined,
        error
      );
    }
  }

  /**
   * Check if a note exists
   */
  async exists(notePath: string): Promise<boolean> {
    try {
      await this.read(notePath);
      return true;
    } catch (error) {
      if (error instanceof RepositoryError && error.code === "NOT_FOUND") {
        return false;
      }
      // Re-throw other errors
      throw error;
    }
  }
}
