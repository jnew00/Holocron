/**
 * Custom hook for page-level event handlers
 * Coordinates between note operations and UI refresh triggers
 */

import { useCallback } from "react";
import { NoteTemplate } from "@/lib/templates/templates";

interface NoteOperations {
  handleNewNote: () => Promise<boolean>;
  handleTemplateSelect: (template: NoteTemplate) => Promise<boolean>;
  handleSelectNote: (notePath: string) => Promise<void>;
  handleDeleteNote: (notePath: string) => Promise<boolean>;
  handleArchiveNote: (notePath: string) => Promise<boolean>;
  handleSave: () => Promise<boolean>;
}

interface UsePageHandlersProps {
  noteOps: NoteOperations;
  setRefreshTrigger: (updater: (prev: number) => number) => void;
  setActiveTab: (tab: string) => void;
}

export function usePageHandlers({
  noteOps,
  setRefreshTrigger,
  setActiveTab,
}: UsePageHandlersProps) {
  const handleNewNote = useCallback(async () => {
    const success = await noteOps.handleNewNote();
    if (success) setRefreshTrigger((prev) => prev + 1);
  }, [noteOps, setRefreshTrigger]);

  const handleTemplateSelect = useCallback(async (template: NoteTemplate) => {
    const success = await noteOps.handleTemplateSelect(template);
    if (success) setRefreshTrigger((prev) => prev + 1);
  }, [noteOps, setRefreshTrigger]);

  const handleSelectNote = useCallback(async (notePath: string) => {
    await noteOps.handleSelectNote(notePath);
    setActiveTab("notes");
  }, [noteOps, setActiveTab]);

  const handleDeleteNote = useCallback(async (notePath: string) => {
    const success = await noteOps.handleDeleteNote(notePath);
    if (success) setRefreshTrigger((prev) => prev + 1);
  }, [noteOps, setRefreshTrigger]);

  const handleArchiveNote = useCallback(async (notePath: string) => {
    const success = await noteOps.handleArchiveNote(notePath);
    if (success) setRefreshTrigger((prev) => prev + 1);
  }, [noteOps, setRefreshTrigger]);

  const handleSave = useCallback(async () => {
    const titleChanged = await noteOps.handleSave();
    if (titleChanged) setRefreshTrigger((prev) => prev + 1);
  }, [noteOps, setRefreshTrigger]);

  return {
    handleNewNote,
    handleTemplateSelect,
    handleSelectNote,
    handleDeleteNote,
    handleArchiveNote,
    handleSave,
  };
}
