/**
 * Custom hook for auto-saving note content
 * Debounces saves and tracks current note content
 */

import { useEffect, useRef } from "react";
import { extractFrontmatter } from "@/lib/notes/frontmatter";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  path?: string;
  type?: string;
}

interface UseAutoSaveProps {
  currentNote: Note | null;
  markdown: string;
  repoPath: string | null;
  onSave: () => Promise<boolean>;
}

export function useAutoSave({ currentNote, markdown, repoPath, onSave }: UseAutoSaveProps) {
  const currentNoteRef = useRef<Note | null>(null);

  // Keep ref in sync with currentNote
  useEffect(() => {
    currentNoteRef.current = currentNote;
  }, [currentNote]);

  // Auto-save every 2 seconds when content changes
  useEffect(() => {
    const note = currentNoteRef.current;
    if (!note || !repoPath) return;

    const timeoutId = setTimeout(async () => {
      // Extract content from currentNote (without frontmatter) to compare
      const { content: currentContentWithoutFrontmatter } = extractFrontmatter(note.content);
      if (markdown.trim() !== currentContentWithoutFrontmatter.trim()) {
        await onSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [markdown, repoPath, onSave]);
}
