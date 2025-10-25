/**
 * Git Repository
 * Centralized data access layer for git operations
 */

import { BaseRepository, RepositoryError } from "./base";

export interface GitStatusResult {
  modified: string[];
  created: string[];
  deleted: string[];
  renamed: string[];
  staged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
  current: string;
  tracking: string | null;
  detached: boolean;
}

export interface GitBranch {
  name: string;
  current: boolean;
  commit: string;
}

export interface CommitOptions {
  message: string;
  author?: {
    name: string;
    email: string;
  };
  passphrase?: string;
}

export interface PullOptions {
  remote?: string;
  branch?: string;
  passphrase?: string;
}

export interface PushOptions {
  remote?: string;
  branch?: string;
  force?: boolean;
}

/**
 * Repository for git operations
 */
export class GitRepository extends BaseRepository {
  constructor(private readonly repoPath: string) {
    super();
  }

  /**
   * Get git status
   */
  async status(): Promise<GitStatusResult> {
    try {
      return await this.post("/api/git/status", {
        repoPath: this.repoPath,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to get git status", "STATUS_FAILED", undefined, error);
    }
  }

  /**
   * Create a git commit
   */
  async commit(options: CommitOptions): Promise<{ success: boolean; message: string; hash?: string }> {
    try {
      return await this.post("/api/git/commit", {
        repoPath: this.repoPath,
        ...options,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to commit changes", "COMMIT_FAILED", undefined, error);
    }
  }

  /**
   * Pull from remote
   */
  async pull(options: PullOptions = {}): Promise<{ success: boolean; message: string }> {
    try {
      return await this.post("/api/git/pull", {
        repoPath: this.repoPath,
        ...options,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to pull from remote", "PULL_FAILED", undefined, error);
    }
  }

  /**
   * Push to remote
   */
  async push(options: PushOptions = {}): Promise<{ success: boolean; message: string }> {
    try {
      return await this.post("/api/git/push", {
        repoPath: this.repoPath,
        ...options,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to push to remote", "PUSH_FAILED", undefined, error);
    }
  }

  /**
   * List branches
   */
  async branches(): Promise<GitBranch[]> {
    const url = this.buildUrl("/api/git/branches", {
      repoPath: this.repoPath,
    });

    try {
      const response = await this.get<{ branches: GitBranch[] }>(url);
      return response.branches;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to list branches", "BRANCHES_FAILED", undefined, error);
    }
  }

  /**
   * Get git config
   */
  async getConfig(): Promise<{ name?: string; email?: string }> {
    const url = this.buildUrl("/api/git/config", {
      repoPath: this.repoPath,
    });

    try {
      return await this.get(url);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to get git config", "CONFIG_FAILED", undefined, error);
    }
  }

  /**
   * Set git config
   */
  async setConfig(config: { name?: string; email?: string }): Promise<void> {
    try {
      await this.post("/api/git/config", {
        repoPath: this.repoPath,
        ...config,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError("Failed to set git config", "CONFIG_SET_FAILED", undefined, error);
    }
  }
}
