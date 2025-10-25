/**
 * Kanban Repository
 * Centralized data access layer for kanban board operations
 */

import { BaseRepository, RepositoryError } from "./base";
import { KanbanBoard } from "@/lib/kanban/types";

export interface KanbanBoardFile {
  path: string;
  name: string;
}

/**
 * Repository for kanban board operations
 * Kanban boards are stored as JSON files in the kanban/ directory
 */
export class KanbanRepository extends BaseRepository {
  constructor(private readonly repoPath: string) {
    super();
  }

  /**
   * List all kanban board files
   */
  async list(): Promise<KanbanBoardFile[]> {
    const url = this.buildUrl("/api/kanban/list", {
      repoPath: this.repoPath,
    });

    try {
      const response = await this.get<{ boards: KanbanBoardFile[] }>(url);
      return response.boards;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to list kanban boards", "LIST_FAILED", undefined, error);
    }
  }

  /**
   * List all kanban boards with their full content
   */
  async listBoards(): Promise<KanbanBoard[]> {
    try {
      const boardFiles = await this.list();
      const boards: KanbanBoard[] = [];

      for (const boardFile of boardFiles) {
        try {
          const board = await this.readBoard(boardFile.path.replace('kanban/', '').replace('.json', ''));
          boards.push(board);
        } catch (err) {
          console.error(`Failed to load board ${boardFile.path}:`, err);
        }
      }

      return boards;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to list kanban boards", "LIST_FAILED", undefined, error);
    }
  }

  /**
   * Read a specific kanban board
   */
  async readBoard(boardId: string): Promise<KanbanBoard> {
    const url = this.buildUrl("/api/notes/read", {
      repoPath: this.repoPath,
      notePath: `kanban/${boardId}.json`,
    });

    try {
      const response = await this.get<{ content: string }>(url);
      return JSON.parse(response.content);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to read kanban board", "READ_FAILED", undefined, error);
    }
  }

  /**
   * Save a kanban board
   */
  async saveBoard(board: KanbanBoard): Promise<void> {
    const url = this.buildUrl("/api/notes/write", {});

    try {
      await this.post(url, {
        repoPath: this.repoPath,
        notePath: `kanban/${board.id}.json`,
        content: JSON.stringify(board, null, 2),
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to save kanban board", "WRITE_FAILED", undefined, error);
    }
  }

  /**
   * Delete a kanban board
   */
  async deleteBoard(boardId: string): Promise<void> {
    const url = this.buildUrl("/api/notes/delete", {
      repoPath: this.repoPath,
      notePath: `kanban/${boardId}.json`,
    });

    try {
      await this.delete(url);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to delete kanban board", "DELETE_FAILED", undefined, error);
    }
  }
}
