/**
 * Client-side Git service that communicates with Git API routes
 * Uses GitRepository for data access
 */

import { GitRepository, RepositoryError } from "@/lib/repositories";

export interface GitStatus {
  branch: string;
  modified: number;
  added: number;
  deleted: number;
  untracked: number;
  ahead: number;
  behind: number;
  hasChanges: boolean;
  files?: {
    modified: string[];
    added: string[];
    deleted: string[];
    untracked: string[];
  };
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
}

export interface CommitOptions {
  message: string;
  author?: {
    name: string;
    email: string;
  };
  passphrase?: string;
}

export interface PullResult {
  success: boolean;
  hasConflicts: boolean;
  conflictedFiles?: string[];
  output: string;
}

export interface GitConfig {
  name: string;
  email: string;
}

/**
 * Get the repository path
 * Must be provided by the caller (from RepoContext)
 */
function getRepoPath(repoPath: string | null): string {
  if (!repoPath) {
    throw new Error("Repository path not configured. Please set it in Settings.");
  }
  return repoPath;
}

/**
 * Get Git config (user name and email)
 */
export async function getConfig(
  repoPath: string | null
): Promise<GitConfig> {
  const path = getRepoPath(repoPath);
  const gitRepo = new GitRepository(path);

  try {
    const config = await gitRepo.getConfig();
    return {
      name: config.name || "",
      email: config.email || "",
    };
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

/**
 * Get current Git status
 */
export async function getStatus(
  repoPath: string | null
): Promise<GitStatus> {
  const path = getRepoPath(repoPath);
  const gitRepo = new GitRepository(path);

  try {
    const status = await gitRepo.status();

    // Ensure arrays exist (defensive programming)
    const modified = status.modified || [];
    const created = status.created || [];
    const deleted = status.deleted || [];
    const untracked = status.untracked || [];

    // Adapt repository response to gitService format
    return {
      branch: status.current || 'main',
      modified: modified.length,
      added: created.length,
      deleted: deleted.length,
      untracked: untracked.length,
      ahead: status.ahead || 0,
      behind: status.behind || 0,
      hasChanges: modified.length > 0 || created.length > 0 ||
                  deleted.length > 0 || untracked.length > 0,
      files: {
        modified: modified,
        added: created,
        deleted: deleted,
        untracked: untracked,
      },
    };
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

/**
 * Commit all changes
 */
export async function commit(
  repoPath: string | null,
  options: CommitOptions
): Promise<{ success: boolean; output: string }> {
  const path = getRepoPath(repoPath);
  const gitRepo = new GitRepository(path);

  try {
    const result = await gitRepo.commit(options);
    return { success: result.success, output: result.message };
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

/**
 * Push to remote
 */
export async function push(
  repoPath: string | null,
  remote = "origin",
  branch?: string
): Promise<{ success: boolean; output: string }> {
  const path = getRepoPath(repoPath);
  const gitRepo = new GitRepository(path);

  try {
    const result = await gitRepo.push({ remote, branch });
    return { success: result.success, output: result.message };
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

/**
 * Pull from remote
 */
export async function pull(
  repoPath: string | null,
  remote = "origin",
  branch?: string,
  passphrase?: string
): Promise<PullResult> {
  const path = getRepoPath(repoPath);
  const gitRepo = new GitRepository(path);

  try {
    const result = await gitRepo.pull({ remote, branch, passphrase });
    // Adapt to PullResult format (assuming no conflicts for now)
    return {
      success: result.success,
      hasConflicts: false,
      output: result.message,
    };
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

/**
 * List all branches
 */
export async function listBranches(
  repoPath: string | null
): Promise<GitBranch[]> {
  const path = getRepoPath(repoPath);
  const gitRepo = new GitRepository(path);

  try {
    const branches = await gitRepo.branches();
    // Adapt repository format to gitService format
    return branches.map(b => ({
      name: b.name,
      isCurrent: b.current,
      isRemote: false, // Repository doesn't distinguish remote branches yet
    }));
  } catch (error) {
    if (error instanceof RepositoryError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

/**
 * Create a new branch
 */
export async function createBranch(
  repoPath: string | null,
  branchName: string
): Promise<{ success: boolean; output: string }> {
  const path = getRepoPath(repoPath);

  const response = await fetch("/api/git/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath: path, action: "create", branchName }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to create branch");
  }

  return result;
}

/**
 * Switch to a branch
 */
export async function switchBranch(
  repoPath: string | null,
  branchName: string
): Promise<{ success: boolean; output: string }> {
  const path = getRepoPath(repoPath);

  const response = await fetch("/api/git/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath: path, action: "switch", branchName }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to switch branch");
  }

  return result;
}

/**
 * Delete a branch
 */
export async function deleteBranch(
  repoPath: string | null,
  branchName: string
): Promise<{ success: boolean; output: string }> {
  const path = getRepoPath(repoPath);

  const response = await fetch("/api/git/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath: path, action: "delete", branchName }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete branch");
  }

  return result;
}
