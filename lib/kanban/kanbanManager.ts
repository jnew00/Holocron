/**
 * Kanban board persistence and management
 */

import { encrypt, decrypt } from "@/lib/crypto/aesgcm";
import { KanbanBoard, createDefaultBoard } from "./types";

const KANBAN_FILE = "kanban/board.json.enc";

/**
 * Load kanban board from encrypted file
 */
export async function loadBoard(
  dirHandle: FileSystemDirectoryHandle,
  passphrase: string
): Promise<KanbanBoard> {
  try {
    const kanbanDir = await dirHandle.getDirectoryHandle("kanban");
    const fileHandle = await kanbanDir.getFileHandle("board.json.enc");
    const file = await fileHandle.getFile();
    const encryptedContent = await file.text();
    const decryptedContent = await decrypt(encryptedContent, passphrase);
    return JSON.parse(decryptedContent);
  } catch (error) {
    // Return default board if file doesn't exist
    return createDefaultBoard();
  }
}

/**
 * Save kanban board to encrypted file
 */
export async function saveBoard(
  dirHandle: FileSystemDirectoryHandle,
  board: KanbanBoard,
  passphrase: string
): Promise<void> {
  const kanbanDir = await dirHandle.getDirectoryHandle("kanban", { create: true });
  const encryptedContent = await encrypt(JSON.stringify(board, null, 2), passphrase);

  const fileHandle = await kanbanDir.getFileHandle("board.json.enc", {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(encryptedContent);
  await writable.close();
}

// Re-export types for convenience
export type { KanbanBoard, KanbanCard, KanbanColumn } from "./types";
