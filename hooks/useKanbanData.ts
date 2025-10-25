/**
 * Custom hook for kanban board data management
 * Handles board loading, saving, and task synchronization
 */

import { useState, useEffect, useCallback } from "react";
import { KanbanBoard, createDefaultBoard } from "@/lib/kanban/types";
import { syncTasksToBoard as syncTasksFromNote } from "@/lib/kanban/taskExtractor";
import { NoteRepository, KanbanRepository, RepositoryError } from "@/lib/repositories";

interface UseKanbanDataProps {
  boardId: string;
  repoPath: string | null;
  syncTrigger?: number;
  onBoardUpdate?: () => void;
}

export function useKanbanData({
  boardId,
  repoPath,
  syncTrigger,
  onBoardUpdate,
}: UseKanbanDataProps) {
  const [board, setBoard] = useState<KanbanBoard>(createDefaultBoard());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the board from disk
  const loadBoard = useCallback(async () => {
    if (!repoPath || !boardId) return;

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      const loadedBoard = await kanbanRepo.readBoard(boardId);
      setBoard(loadedBoard);
      setIsLoaded(true);
    } catch (error) {
      if (error instanceof RepositoryError && error.is("NOT_FOUND")) {
        // Only create default board if file doesn't exist (404)
        console.log("Board not found, creating default board");
        const defaultBoard = createDefaultBoard();
        defaultBoard.id = boardId;
        setBoard(defaultBoard);
        setIsLoaded(true);
        await saveBoard(defaultBoard);
      } else {
        // For other errors (permissions, etc), don't overwrite - just log
        console.error("Error loading board:", error);
      }
    }
  }, [repoPath, boardId]);

  // Save current board to disk
  const saveBoard = useCallback(async (boardToSave?: KanbanBoard) => {
    if (!repoPath) return;

    const boardData = boardToSave || board;

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      await kanbanRepo.saveBoard(boardData);

      // Notify parent to refresh boards list
      onBoardUpdate?.();
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to save board:", error.message);
      } else {
        console.error("Failed to save board:", error);
      }
    }
  }, [repoPath, board, onBoardUpdate]);

  // Sync tasks from notes to board
  const syncTasksToBoard = useCallback(async () => {
    if (!repoPath || !isLoaded) return; // Don't sync until board is loaded!

    setIsSyncing(true);
    try {
      const noteRepo = new NoteRepository(repoPath);

      // Fetch all notes
      const notes = await noteRepo.list();

      // Process each note and sync tasks
      let updatedColumns = board.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
      }));

      for (const note of notes) {
        // Skip kanban archive file
        if (note.path.includes("kanban-archive.md")) {
          continue;
        }

        try {
          const noteData = await noteRepo.read(note.path);
          const noteId = note.path;
          const noteTitle = note.name.replace(".md", "");

          // Sync tasks from this note for this specific board
          updatedColumns = syncTasksFromNote(
            noteData.content,
            noteId,
            noteTitle,
            updatedColumns,
            boardId // Pass the current board ID
          );
        } catch (err) {
          console.error(`Failed to process note ${note.path}:`, err);
        }
      }

      setBoard((prev) => ({
        ...prev,
        columns: updatedColumns,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to sync from notes:", error.message);
      } else {
        console.error("Failed to sync from notes:", error);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [repoPath, isLoaded, board.columns, boardId]);

  // Load board on mount
  useEffect(() => {
    if (repoPath && boardId) {
      loadBoard();
    }
  }, [repoPath, boardId, loadBoard]);

  // Sync from notes when syncTrigger changes OR when board finishes loading
  useEffect(() => {
    if (repoPath && boardId && syncTrigger && syncTrigger > 0 && isLoaded) {
      syncTasksToBoard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTrigger, isLoaded]);

  // Auto-save board when it changes (but only after initial load)
  useEffect(() => {
    if (repoPath && board.id && isLoaded && !isSyncing) {
      const timeoutId = setTimeout(() => {
        saveBoard();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, repoPath, isLoaded, isSyncing]);

  return {
    board,
    setBoard,
    isSyncing,
    isLoaded,
    loadBoard,
    saveBoard,
    syncTasksToBoard,
  };
}
