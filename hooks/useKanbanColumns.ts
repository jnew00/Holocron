/**
 * Custom hook for kanban column management
 * Handles column CRUD operations and settings management
 */

import { useState, useCallback } from "react";
import { KanbanBoard } from "@/lib/kanban/types";

type KanbanColumn = KanbanBoard["columns"][0];

interface UseKanbanColumnsProps {
  board: KanbanBoard;
  setBoard: (updater: (prev: KanbanBoard) => KanbanBoard) => void;
}

export function useKanbanColumns({ board, setBoard }: UseKanbanColumnsProps) {
  const [editingColumns, setEditingColumns] = useState<KanbanColumn[]>(board.columns);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Open settings dialog with current columns
  const handleOpenSettings = useCallback(() => {
    setEditingColumns(board.columns.map((col) => ({ ...col })));
    setIsSettingsOpen(true);
  }, [board.columns]);

  // Add a new column to editing state
  const handleAddColumn = useCallback(() => {
    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: "New Column",
      cards: [],
      wipLimit: undefined,
      color: "#6366f1",
    };
    setEditingColumns((prev) => [...prev, newColumn]);
  }, []);

  // Delete a column from editing state
  const handleDeleteColumn = useCallback((columnId: string) => {
    setEditingColumns((prev) => prev.filter((col) => col.id !== columnId));
  }, []);

  // Update a column in editing state
  const handleUpdateColumn = useCallback((columnId: string, updates: Partial<KanbanColumn>) => {
    setEditingColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      )
    );
  }, []);

  // Save column changes to board
  const handleSaveColumns = useCallback(() => {
    setBoard((prev) => ({
      ...prev,
      columns: editingColumns.map((col) => ({
        ...col,
        cards: prev.columns.find((c) => c.id === col.id)?.cards || col.cards,
      })),
      updatedAt: new Date().toISOString(),
    }));
    setIsSettingsOpen(false);
  }, [editingColumns, setBoard]);

  return {
    editingColumns,
    setEditingColumns,
    isSettingsOpen,
    setIsSettingsOpen,
    handleOpenSettings,
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumn,
    handleSaveColumns,
  };
}
