/**
 * Custom hook for note CRUD operations
 * Encapsulates note creation, loading, saving, deletion, and archiving
 */

import { useState, useRef, useCallback } from "react";
import { NoteRepository, RepositoryError } from "@/lib/repositories";
import { addFrontmatter, extractFrontmatter } from "@/lib/notes/frontmatter";
import { NoteTemplate } from "@/lib/templates/templates";

// Note interface
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  path?: string;
  type?: string;
}

export function useNoteOperations(repoPath: string | null) {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [noteFrontmatter, setNoteFrontmatter] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const currentNoteRef = useRef<Note | null>(null);
  const previousTitleRef = useRef<string>("");

  // Keep ref in sync with currentNote
  currentNoteRef.current = currentNote;

  // Helper to generate note path
  const generateNotePath = (title: string, createdAt: string): string => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const slug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "untitled";
    return `${year}/${month}/${day}/${slug}.md`;
  };

  // Helper to generate unique note ID
  const generateNoteId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Create new note
  const handleNewNote = useCallback(async () => {
    if (!repoPath) return;

    const baseContent = "# Untitled Note\n\n";
    const frontmatter = { type: "note" };
    const contentWithFrontmatter = addFrontmatter(baseContent, frontmatter);

    const newNote: Note = {
      id: generateNoteId(),
      title: "Untitled Note",
      content: contentWithFrontmatter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "note",
    };

    newNote.path = generateNotePath(newNote.title, newNote.createdAt);

    try {
      const noteRepo = new NoteRepository(repoPath);
      await noteRepo.write({
        notePath: newNote.path,
        content: contentWithFrontmatter,
      });

      setCurrentNote(newNote);
      setMarkdown(baseContent);
      setNoteFrontmatter(frontmatter);
      previousTitleRef.current = newNote.title;
      return true; // Signal success for refresh trigger
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to create note:", error.message);
      } else {
        console.error("Failed to create note:", error);
      }
      return false;
    }
  }, [repoPath]);

  // Create note from template
  const handleTemplateSelect = useCallback(async (template: NoteTemplate) => {
    if (!repoPath) return;

    const frontmatter = { type: template.type };
    const contentWithFrontmatter = addFrontmatter(template.content, frontmatter);

    const newNote: Note = {
      id: generateNoteId(),
      title: template.name,
      content: contentWithFrontmatter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: template.type,
    };

    newNote.path = generateNotePath(newNote.title, newNote.createdAt);

    try {
      const noteRepo = new NoteRepository(repoPath);
      await noteRepo.write({
        notePath: newNote.path,
        content: contentWithFrontmatter,
      });

      setCurrentNote(newNote);
      setMarkdown(template.content);
      setNoteFrontmatter(frontmatter);
      previousTitleRef.current = newNote.title;
      return true; // Signal success for refresh trigger
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to create note from template:", error.message);
      } else {
        console.error("Failed to create note from template:", error);
      }
      return false;
    }
  }, [repoPath]);

  // Load a note
  const handleSelectNote = useCallback(async (notePath: string) => {
    if (!repoPath) return;

    try {
      const noteRepo = new NoteRepository(repoPath);
      const data = await noteRepo.read(notePath);

      const { data: frontmatter, content: markdownContent } = extractFrontmatter(data.content);
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : "Untitled";

      const note: Note = {
        id: generateNoteId(),
        title,
        content: data.content,
        path: notePath,
        createdAt: data.modified,
        updatedAt: data.modified,
        type: frontmatter.type || "note",
      };

      setCurrentNote(note);
      setMarkdown(markdownContent);
      setNoteFrontmatter(frontmatter);
      previousTitleRef.current = note.title;
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to load note:", error.message);
      } else {
        console.error("Failed to load note:", error);
      }
    }
  }, [repoPath]);

  // Save current note
  const handleSave = useCallback(async (): Promise<boolean> => {
    const note = currentNoteRef.current;
    if (!note || !repoPath || !note.path) return false;

    setIsSaving(true);
    try {
      // Extract title from markdown
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : "Untitled";

      // Check if title changed
      const titleChanged = !!(previousTitleRef.current && previousTitleRef.current !== title);
      previousTitleRef.current = title;

      // Merge frontmatter with markdown
      const mergedFrontmatter = {
        ...noteFrontmatter,
        type: note.type || noteFrontmatter.type || "note",
      };
      const contentToSave = addFrontmatter(markdown, mergedFrontmatter);

      const updatedNote: Note = {
        ...note,
        title,
        content: contentToSave,
        updatedAt: new Date().toISOString(),
      };

      const noteRepo = new NoteRepository(repoPath);
      await noteRepo.write({
        notePath: note.path,
        content: contentToSave,
      });

      currentNoteRef.current = updatedNote;
      setLastSaved(new Date());
      setCurrentNote(updatedNote);

      return titleChanged; // Return true if refresh needed
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to save note:", error.message);
      } else {
        console.error("Failed to save note:", error);
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [repoPath, markdown, noteFrontmatter]);

  // Delete a note
  const handleDeleteNote = useCallback(async (notePath: string) => {
    if (!repoPath) return;

    try {
      const noteRepo = new NoteRepository(repoPath);
      await noteRepo.deleteNote(notePath);

      if (currentNote?.path === notePath) {
        setCurrentNote(null);
        setMarkdown("");
      }
      return true; // Signal success for refresh trigger
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to delete note:", error.message);
      } else {
        console.error("Failed to delete note:", error);
      }
      return false;
    }
  }, [repoPath, currentNote]);

  // Archive a note
  const handleArchiveNote = useCallback(async (notePath: string) => {
    if (!repoPath) return;

    try {
      const noteRepo = new NoteRepository(repoPath);

      // Read the note
      const data = await noteRepo.read(notePath);

      // Create archive path
      const archivePath = `archive/${notePath}`;

      // Write to archive
      await noteRepo.write({
        notePath: archivePath,
        content: data.content,
      });

      // Delete original
      await handleDeleteNote(notePath);

      return true; // Signal success for refresh trigger
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to archive note:", error.message);
      } else {
        console.error("Failed to archive note:", error);
      }
      return false;
    }
  }, [repoPath, handleDeleteNote]);

  return {
    // State
    currentNote,
    markdown,
    setMarkdown,
    noteFrontmatter,
    isSaving,
    lastSaved,

    // Actions
    handleNewNote,
    handleTemplateSelect,
    handleSelectNote,
    handleSave,
    handleDeleteNote,
    handleArchiveNote,
  };
}
