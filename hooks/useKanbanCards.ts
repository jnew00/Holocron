/**
 * Custom hook for kanban card CRUD operations
 * Handles adding, deleting, updating, and archiving cards
 */

import { useState, useCallback } from "react";
import { KanbanBoard, KanbanCard, createCard } from "@/lib/kanban/types";
import { NoteRepository, RepositoryError } from "@/lib/repositories";

interface UseKanbanCardsProps {
  board: KanbanBoard;
  setBoard: (updater: (prev: KanbanBoard) => KanbanBoard) => void;
  repoPath: string | null;
}

export function useKanbanCards({ board, setBoard, repoPath }: UseKanbanCardsProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  // Add a new card to a column
  const handleAddCard = useCallback((title: string, description: string | undefined, columnId: string) => {
    if (!title.trim()) return;

    const card = createCard(title, description);

    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, card],
          };
        }
        return col;
      });

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [setBoard]);

  // Delete a card
  const handleDeleteCard = useCallback((cardId: string) => {
    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      }));

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [setBoard]);

  // Update a card
  const handleUpdateCard = useCallback((cardId: string, updates: Partial<KanbanCard>) => {
    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      }));

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [setBoard]);

  // Archive all cards from a column
  const handleArchiveDoneColumn = useCallback(async (columnId: string) => {
    if (!repoPath) return;

    const doneColumn = board.columns.find((col) => col.id === columnId);
    if (!doneColumn || doneColumn.cards.length === 0) return;

    setIsSyncing(true);
    try {
      // Create archive entry
      const archiveEntry = {
        archivedAt: new Date().toISOString(),
        cards: doneColumn.cards.map((card) => ({
          title: card.title,
          description: card.description,
          tags: card.tags,
          createdAt: card.createdAt,
          completedAt: new Date().toISOString(),
        })),
      };

      // Read existing archive file (stored in archive folder)
      const archivePath = "archive/kanban-archive.md";
      let archiveContent = "";
      const noteRepo = new NoteRepository(repoPath);

      try {
        const data = await noteRepo.read(archivePath);
        archiveContent = data.content;
      } catch (err) {
        // Archive file doesn't exist yet, will create it
      }

      // Append new archived tasks to the file
      const newArchiveSection = `
## Archived ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

${doneColumn.cards.map((card) => {
  const noteInfo = card.description?.match(/From: (.+) \(Line \d+\)/) || [];
  const fromNote = noteInfo[1] || "Manual entry";
  return `- [x] ${card.title} ${fromNote ? `_(from ${fromNote})_` : ""}\n  - Completed: ${new Date().toLocaleString()}`;
}).join('\n')}

---
`;

      // Prepend new entries to the top (most recent first)
      const updatedArchiveContent = archiveContent
        ? `# Kanban Archive\n\n${newArchiveSection}\n${archiveContent.replace(/^#\s+Kanban Archive\n+/, '')}`
        : `# Kanban Archive\n\n${newArchiveSection}`;

      // Write archive file
      await noteRepo.write({
        notePath: archivePath,
        content: updatedArchiveContent,
      });

      // Remove archived cards from board
      setBoard((prev) => {
        const newColumns = prev.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: [],
            };
          }
          return col;
        });

        return {
          ...prev,
          columns: newColumns,
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Failed to archive tasks:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [repoPath, board.columns, setBoard]);

  return {
    isSyncing,
    handleAddCard,
    handleDeleteCard,
    handleUpdateCard,
    handleArchiveDoneColumn,
  };
}
