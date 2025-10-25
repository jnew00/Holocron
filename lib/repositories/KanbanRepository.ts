/**
 * Kanban Repository
 * Centralized data access layer for kanban board operations
 */

import { BaseRepository, RepositoryError } from "./base";

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
}
