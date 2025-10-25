/**
 * Client-side Git service that communicates with Git API routes
 * Uses system Git CLI via Next.js API routes for full Git functionality
 */

export interface GitStatus {
  branch: string;
  modified: number;
  added: number;
  deleted: number;
  untracked: number;
  ahead: number;
  behind: number;
  hasChanges: boolean;
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

  const response = await fetch(`/api/git/config?repoPath=${encodeURIComponent(path)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get Git config");
  }

  return response.json();
}

/**
 * Get current Git status
 */
export async function getStatus(
  repoPath: string | null
): Promise<GitStatus> {
  const path = getRepoPath(repoPath);

  const response = await fetch("/api/git/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath: path }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get Git status");
  }

  return response.json();
}

/**
 * Commit all changes
 */
export async function commit(
  repoPath: string | null,
  options: CommitOptions
): Promise<{ success: boolean; output: string }> {
  const path = getRepoPath(repoPath);

  const response = await fetch("/api/git/commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repoPath: path,
      message: options.message,
      author: options.author,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to commit");
  }

  return result;
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

  const response = await fetch("/api/git/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath: path, remote, branch }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to push");
  }

  return result;
}

/**
 * Pull from remote
 */
export async function pull(
  repoPath: string | null,
  remote = "origin",
  branch?: string
): Promise<PullResult> {
  const path = getRepoPath(repoPath);

  const response = await fetch("/api/git/pull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath: path, remote, branch }),
  });

  const result = await response.json();

  if (!response.ok && !result.hasConflicts) {
    throw new Error(result.error || "Failed to pull");
  }

  return result;
}

/**
 * List all branches
 */
export async function listBranches(
  repoPath: string | null
): Promise<GitBranch[]> {
  const path = getRepoPath(repoPath);

  const response = await fetch(`/api/git/branches?repoPath=${encodeURIComponent(path)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to list branches");
  }

  const result = await response.json();
  return result.branches;
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
