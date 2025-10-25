/**
 * Git integration for LocalNote
 * Uses isomorphic-git with File System Access API
 */

import git from "isomorphic-git";
import http from "isomorphic-git/http/web";

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: number;
  untracked: number;
  hasChanges: boolean;
  files: string[];
}

export interface GitConflict {
  file: string;
  content: string;
}

export interface GitConfig {
  name: string;
  email: string;
  remote?: string;
}

// File system adapter for isomorphic-git to work with FileSystemDirectoryHandle
class FSAccessFS {
  private dirHandle: FileSystemDirectoryHandle;

  constructor(dirHandle: FileSystemDirectoryHandle) {
    this.dirHandle = dirHandle;
  }

  async readFile(filepath: string): Promise<Uint8Array> {
    const parts = filepath.split("/").filter(Boolean);
    let current: FileSystemDirectoryHandle | FileSystemFileHandle = this.dirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      current = await (current as FileSystemDirectoryHandle).getDirectoryHandle(parts[i]);
    }

    const fileHandle = await (current as FileSystemDirectoryHandle).getFileHandle(parts[parts.length - 1]);
    const file = await fileHandle.getFile();
    return new Uint8Array(await file.arrayBuffer());
  }

  async writeFile(filepath: string, data: Uint8Array): Promise<void> {
    const parts = filepath.split("/").filter(Boolean);
    let current = this.dirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i], { create: true });
    }

    const fileHandle = await current.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }

  async unlink(filepath: string): Promise<void> {
    const parts = filepath.split("/").filter(Boolean);
    let current = this.dirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i]);
    }

    await current.removeEntry(parts[parts.length - 1]);
  }

  async readdir(filepath: string): Promise<string[]> {
    const parts = filepath.split("/").filter(Boolean);
    let current = this.dirHandle;

    for (const part of parts) {
      if (part) {
        current = await current.getDirectoryHandle(part);
      }
    }

    const entries: string[] = [];
    for await (const entry of current.values()) {
      entries.push(entry.name);
    }
    return entries;
  }

  async mkdir(filepath: string): Promise<void> {
    const parts = filepath.split("/").filter(Boolean);
    let current = this.dirHandle;

    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: true });
    }
  }

  async rmdir(filepath: string): Promise<void> {
    const parts = filepath.split("/").filter(Boolean);
    let current = this.dirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i]);
    }

    await current.removeEntry(parts[parts.length - 1], { recursive: true });
  }

  async stat(filepath: string): Promise<{ type: string; size: number }> {
    const parts = filepath.split("/").filter(Boolean);
    let current: FileSystemDirectoryHandle | FileSystemFileHandle = this.dirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      current = await (current as FileSystemDirectoryHandle).getDirectoryHandle(parts[i]);
    }

    try {
      const fileHandle = await (current as FileSystemDirectoryHandle).getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      return { type: "file", size: file.size };
    } catch {
      await (current as FileSystemDirectoryHandle).getDirectoryHandle(parts[parts.length - 1]);
      return { type: "dir", size: 0 };
    }
  }

  async lstat(filepath: string) {
    return this.stat(filepath);
  }

  async symlink(): Promise<void> {
    throw new Error("Symlinks not supported");
  }

  async readlink(): Promise<string> {
    throw new Error("Symlinks not supported");
  }
}

/**
 * Check if directory is a git repository
 */
export async function isGitRepo(dirHandle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    await dirHandle.getDirectoryHandle(".git");
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize a new git repository
 */
export async function initRepo(dirHandle: FileSystemDirectoryHandle): Promise<void> {
  const fs = new FSAccessFS(dirHandle);

  try {
    await git.init({
      fs: fs as any,
      dir: "/",
      defaultBranch: "main",
    });
  } catch (error) {
    console.error("Git init error:", error);
    throw new Error("Failed to initialize git repository");
  }
}

/**
 * Get current git status
 */
export async function getStatus(dirHandle: FileSystemDirectoryHandle): Promise<GitStatus> {
  // Since we can't call git commands directly from the browser,
  // we'll need to use isomorphic-git or similar
  // For now, return a placeholder

  return {
    branch: "main",
    ahead: 0,
    behind: 0,
    modified: 0,
    untracked: 0,
    hasChanges: false,
  };
}

/**
 * Stage all changes
 */
export async function addAll(dirHandle: FileSystemDirectoryHandle): Promise<void> {
  // Placeholder - needs isomorphic-git
  throw new Error("Git operations require isomorphic-git library");
}

/**
 * Commit staged changes
 */
export async function commit(
  dirHandle: FileSystemDirectoryHandle,
  message: string
): Promise<void> {
  // Placeholder - needs isomorphic-git
  throw new Error("Git operations require isomorphic-git library");
}

/**
 * Push to remote
 */
export async function push(
  dirHandle: FileSystemDirectoryHandle,
  remote: string = "origin",
  branch: string = "main"
): Promise<void> {
  // Placeholder - needs isomorphic-git
  throw new Error("Git operations require isomorphic-git library");
}

/**
 * Pull from remote
 */
export async function pull(
  dirHandle: FileSystemDirectoryHandle,
  remote: string = "origin",
  branch: string = "main"
): Promise<void> {
  // Placeholder - needs isomorphic-git
  throw new Error("Git operations require isomorphic-git library");
}

/**
 * Detect merge conflicts
 */
export async function detectConflicts(
  dirHandle: FileSystemDirectoryHandle
): Promise<GitConflict[]> {
  const conflicts: GitConflict[] = [];

  // Check for conflict markers in files
  // This would need to scan all files for <<<<<<< markers

  return conflicts;
}

/**
 * Configure git user
 */
export async function configureUser(
  dirHandle: FileSystemDirectoryHandle,
  name: string,
  email: string
): Promise<void> {
  // Placeholder - needs isomorphic-git
  throw new Error("Git operations require isomorphic-git library");
}
