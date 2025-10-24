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

/**
 * Get the repository path from FileSystemDirectoryHandle
 * Note: This is a workaround - we'll need to store the path when user selects directory
 */
function getRepoPath(dirHandle: FileSystemDirectoryHandle): string {
  // For now, we'll use the current working directory
  // In production, you'd need to store the actual path when user selects the directory
  return (dirHandle as any).name || "/Users/Jason/Development/NoteTaker";
}

/**
 * Get current Git status
 */
export async function getStatus(
  dirHandle: FileSystemDirectoryHandle
): Promise<GitStatus> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch("/api/git/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath }),
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
  dirHandle: FileSystemDirectoryHandle,
  options: CommitOptions
): Promise<{ success: boolean; output: string }> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch("/api/git/commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repoPath,
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
  dirHandle: FileSystemDirectoryHandle,
  remote = "origin",
  branch?: string
): Promise<{ success: boolean; output: string }> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch("/api/git/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath, remote, branch }),
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
  dirHandle: FileSystemDirectoryHandle,
  remote = "origin",
  branch?: string
): Promise<PullResult> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch("/api/git/pull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath, remote, branch }),
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
  dirHandle: FileSystemDirectoryHandle
): Promise<GitBranch[]> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch(`/api/git/branches?repoPath=${encodeURIComponent(repoPath)}`);

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
  dirHandle: FileSystemDirectoryHandle,
  branchName: string
): Promise<{ success: boolean; output: string }> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch("/api/git/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath, action: "create", branchName }),
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
  dirHandle: FileSystemDirectoryHandle,
  branchName: string
): Promise<{ success: boolean; output: string }> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch("/api/git/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath, action: "switch", branchName }),
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
  dirHandle: FileSystemDirectoryHandle,
  branchName: string
): Promise<{ success: boolean; output: string }> {
  const repoPath = getRepoPath(dirHandle);

  const response = await fetch("/api/git/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoPath, action: "delete", branchName }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete branch");
  }

  return result;
}
