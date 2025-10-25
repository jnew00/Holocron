/**
 * Main Kanban Board component - refactored for simplicity
 * Uses custom hooks for business logic and sub-components for UI
 */

"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { useKanbanData } from "@/hooks/useKanbanData";
import { useKanbanDragDrop } from "@/hooks/useKanbanDragDrop";
import { useKanbanCards } from "@/hooks/useKanbanCards";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";
import { KanbanBoardView } from "./KanbanBoardView";
import { KanbanAddCardDialog } from "./KanbanAddCardDialog";
import { KanbanColumnSettings } from "./KanbanColumnSettings";

interface KanbanBoardProps {
  boardId: string;
  onBoardUpdate?: () => void;
  syncTrigger?: number;
}

export function KanbanBoard({ boardId, onBoardUpdate, syncTrigger }: KanbanBoardProps) {
  const { repoPath } = useRepo();
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

  // Data management hook
  const {
    board,
    setBoard,
    isSyncing,
    isLoaded,
    syncTasksToBoard,
  } = useKanbanData({
    boardId,
    repoPath,
    syncTrigger,
    onBoardUpdate,
  });

  // Drag and drop hook
  const {
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanDragDrop({ board, setBoard });

  // Card operations hook
  const {
    isSyncing: isArchiving,
    handleAddCard,
    handleDeleteCard,
    handleUpdateCard,
    handleArchiveDoneColumn,
  } = useKanbanCards({ board, setBoard, repoPath });

  // Column operations hook
  const {
    editingColumns,
    setEditingColumns,
    isSettingsOpen,
    setIsSettingsOpen,
    handleOpenSettings,
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumn,
    handleSaveColumns,
  } = useKanbanColumns({ board, setBoard });

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <KanbanAddCardDialog
          open={isAddCardDialogOpen}
          onOpenChange={setIsAddCardDialogOpen}
          onAddCard={handleAddCard}
          columns={board.columns}
        />
      </div>

      <KanbanBoardView
        board={board}
        activeCard={activeCard}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDeleteCard={handleDeleteCard}
        onUpdateCard={handleUpdateCard}
        onArchiveDoneColumn={handleArchiveDoneColumn}
        onOpenSettings={handleOpenSettings}
        onOpenAddCard={() => setIsAddCardDialogOpen(true)}
        onSync={syncTasksToBoard}
        isSyncing={isSyncing || isArchiving}
      />

      <KanbanColumnSettings
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        columns={board.columns}
        editingColumns={editingColumns}
        onEditingColumnsChange={setEditingColumns}
        onSave={handleSaveColumns}
        onAddColumn={handleAddColumn}
        onDeleteColumn={handleDeleteColumn}
        onUpdateColumn={handleUpdateColumn}
      />
    </>
  );
}
