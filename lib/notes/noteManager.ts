/**
 * Note management - save, load, list encrypted notes
 */

import { encrypt, decrypt } from "@/lib/crypto/aesgcm";

export type NoteType =
  | "note"
  | "todo"
  | "meeting"
  | "scratchpad"
  | "til"
  | "project"
  | "weekly"
  | "book";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  type?: NoteType;
}

export interface NoteMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  type?: NoteType;
}

/**
 * Generate a slug from a title for the filename
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get the file path for a note (YYYY/MM/DD/slug.md.enc)
 */
function getNoteFilePath(date: Date, slug: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `notes/${year}/${month}/${day}/${slug}.md.enc`;
}

/**
 * Save a note to encrypted file
 */
export async function saveNote(
  dirHandle: FileSystemDirectoryHandle,
  note: Note,
  passphrase: string
): Promise<void> {
  const date = new Date(note.createdAt);
  const slug = slugify(note.title) || "untitled";

  // Create directory structure
  const notesDir = await dirHandle.getDirectoryHandle("notes", { create: true });
  const yearDir = await notesDir.getDirectoryHandle(String(date.getFullYear()), {
    create: true,
  });
  const monthDir = await yearDir.getDirectoryHandle(
    String(date.getMonth() + 1).padStart(2, "0"),
    { create: true }
  );
  const dayDir = await monthDir.getDirectoryHandle(
    String(date.getDate()).padStart(2, "0"),
    { create: true }
  );

  // Create the note content with metadata
  const noteData = {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: new Date().toISOString(),
    archived: note.archived || false,
    type: note.type || "note",
  };

  // Encrypt the note
  const encryptedContent = await encrypt(JSON.stringify(noteData), passphrase);

  // Save to file
  const fileName = `${slug}.md.enc`;
  const fileHandle = await dayDir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(encryptedContent);
  await writable.close();
}

/**
 * Load a note from encrypted file
 */
export async function loadNote(
  dirHandle: FileSystemDirectoryHandle,
  filePath: string,
  passphrase: string
): Promise<Note> {
  const parts = filePath.split("/");
  // parts: ["notes", year, month, day, "filename.md.enc"]

  const notesDir = await dirHandle.getDirectoryHandle("notes");
  const yearDir = await notesDir.getDirectoryHandle(parts[1]);
  const monthDir = await yearDir.getDirectoryHandle(parts[2]);
  const dayDir = await monthDir.getDirectoryHandle(parts[3]);
  const fileHandle = await dayDir.getFileHandle(parts[4]);

  const file = await fileHandle.getFile();
  const encryptedContent = await file.text();

  const decryptedContent = await decrypt(encryptedContent, passphrase);
  return JSON.parse(decryptedContent);
}

/**
 * List all notes (with metadata only)
 */
export async function listNotes(
  dirHandle: FileSystemDirectoryHandle,
  passphrase: string,
  includeArchived = false
): Promise<NoteMetadata[]> {
  const notes: NoteMetadata[] = [];

  try {
    const notesDir = await dirHandle.getDirectoryHandle("notes");

    // Iterate through year/month/day structure
    for await (const yearEntry of notesDir.values()) {
      if (yearEntry.kind !== "directory") continue;
      const yearDir = yearEntry as FileSystemDirectoryHandle;

      for await (const monthEntry of yearDir.values()) {
        if (monthEntry.kind !== "directory") continue;
        const monthDir = monthEntry as FileSystemDirectoryHandle;

        for await (const dayEntry of monthDir.values()) {
          if (dayEntry.kind !== "directory") continue;
          const dayDir = dayEntry as FileSystemDirectoryHandle;

          for await (const fileEntry of dayDir.values()) {
            if (fileEntry.kind !== "file") continue;
            const fileHandle = fileEntry as FileSystemFileHandle;
            if (!fileHandle.name.endsWith(".md.enc")) continue;

            try {
              const file = await fileHandle.getFile();
              const encryptedContent = await file.text();
              const decryptedContent = await decrypt(encryptedContent, passphrase);
              const note = JSON.parse(decryptedContent);

              if (!includeArchived && note.archived) continue;

              notes.push({
                id: note.id,
                title: note.title,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                archived: note.archived,
                type: note.type || "note",
              });
            } catch (error) {
              console.error(`Failed to load note ${fileHandle.name}:`, error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to list notes:", error);
  }

  // Sort by updatedAt descending
  return notes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Delete a note file
 */
export async function deleteNote(
  dirHandle: FileSystemDirectoryHandle,
  note: Note
): Promise<void> {
  const date = new Date(note.createdAt);
  const slug = slugify(note.title) || "untitled";

  const notesDir = await dirHandle.getDirectoryHandle("notes");
  const yearDir = await notesDir.getDirectoryHandle(String(date.getFullYear()));
  const monthDir = await yearDir.getDirectoryHandle(
    String(date.getMonth() + 1).padStart(2, "0")
  );
  const dayDir = await monthDir.getDirectoryHandle(
    String(date.getDate()).padStart(2, "0")
  );

  await dayDir.removeEntry(`${slug}.md.enc`);
}

/**
 * Archive a note (toggle archived status)
 */
export async function archiveNote(
  dirHandle: FileSystemDirectoryHandle,
  note: Note,
  passphrase: string
): Promise<void> {
  const updatedNote = {
    ...note,
    archived: !note.archived,
    updatedAt: new Date().toISOString(),
  };

  await saveNote(dirHandle, updatedNote, passphrase);
}

/**
 * Generate a unique note ID
 */
export function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
