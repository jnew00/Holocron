/**
 * Repository file system operations
 * Handles initialization and structure of the LocalNote repository
 */

import { encrypt } from "../crypto/aesgcm";

export interface RepoConfig {
  version: string;
  repoPath: string;
  createdAt: string;
  lastUnlocked?: string;
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

/**
 * Request directory access from user
 */
export async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle> {
  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API not supported");
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: "readwrite",
      id: "localnote-repo",
      startIn: "documents",
    });
    return dirHandle;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("Directory selection cancelled");
    }
    throw error;
  }
}

/**
 * Initialize repository structure
 */
export async function initializeRepo(
  dirHandle: FileSystemDirectoryHandle,
  passphrase: string
): Promise<void> {
  // Create directory structure
  await dirHandle.getDirectoryHandle("notes", { create: true });
  await dirHandle.getDirectoryHandle("assets", { create: true });
  await dirHandle.getDirectoryHandle("kanban", { create: true });
  const configDir = await dirHandle.getDirectoryHandle("config", { create: true });

  // Create config
  const config: RepoConfig = {
    version: "1.0.0",
    repoPath: dirHandle.name,
    createdAt: new Date().toISOString(),
  };

  // Encrypt and save config
  const configJson = JSON.stringify(config, null, 2);
  const encryptedConfig = await encrypt(configJson, passphrase);

  const configFile = await configDir.getFileHandle("config.json.enc", {
    create: true,
  });
  const writable = await configFile.createWritable();
  await writable.write(encryptedConfig);
  await writable.close();

  // Create a test file for passphrase validation
  const testData = "localnote-initialized";
  const encryptedTest = await encrypt(testData, passphrase);

  const testFile = await configDir.getFileHandle(".passphrase-test.enc", {
    create: true,
  });
  const testWritable = await testFile.createWritable();
  await testWritable.write(encryptedTest);
  await testWritable.close();
}

/**
 * Check if directory is already a LocalNote repo
 */
export async function isValidRepo(
  dirHandle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    const configDir = await dirHandle.getDirectoryHandle("config");
    await configDir.getFileHandle("config.json.enc");
    await configDir.getFileHandle(".passphrase-test.enc");
    return true;
  } catch {
    return false;
  }
}

/**
 * Read encrypted config file
 */
export async function readConfig(
  dirHandle: FileSystemDirectoryHandle,
  passphrase: string
): Promise<RepoConfig> {
  const { decrypt } = await import("../crypto/aesgcm");

  try {
    const configDir = await dirHandle.getDirectoryHandle("config");
    const configFile = await configDir.getFileHandle("config.json.enc");
    const file = await configFile.getFile();
    const encryptedContent = await file.text();

    const decryptedContent = await decrypt(encryptedContent, passphrase);
    return JSON.parse(decryptedContent);
  } catch (error) {
    throw new Error("Failed to read config: " + (error as Error).message);
  }
}

/**
 * Validate passphrase against test file
 */
export async function validateRepoPassphrase(
  dirHandle: FileSystemDirectoryHandle,
  passphrase: string
): Promise<boolean> {
  const { decrypt } = await import("../crypto/aesgcm");

  try {
    const configDir = await dirHandle.getDirectoryHandle("config");
    const testFile = await configDir.getFileHandle(".passphrase-test.enc");
    const file = await testFile.getFile();
    const encryptedContent = await file.text();

    const decryptedContent = await decrypt(encryptedContent, passphrase);
    return decryptedContent === "localnote-initialized";
  } catch {
    return false;
  }
}

/**
 * Update last unlocked timestamp
 */
export async function updateLastUnlocked(
  dirHandle: FileSystemDirectoryHandle,
  passphrase: string
): Promise<void> {
  const config = await readConfig(dirHandle, passphrase);
  config.lastUnlocked = new Date().toISOString();

  const configJson = JSON.stringify(config, null, 2);
  const encryptedConfig = await encrypt(configJson, passphrase);

  const configDir = await dirHandle.getDirectoryHandle("config");
  const configFile = await configDir.getFileHandle("config.json.enc");
  const writable = await configFile.createWritable();
  await writable.write(encryptedConfig);
  await writable.close();
}
