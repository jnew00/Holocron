/**
 * Custom hook for kanban board CRUD operations
 * Handles creating, updating, and deleting boards
 */

import { useState, useCallback } from "react";
import { KanbanBoard, createDefaultBoard } from "@/lib/kanban/types";
import { KanbanRepository, RepositoryError } from "@/lib/repositories";

interface UseBoardOperationsProps {
  repoPath: string | null;
  onBoardsChange: () => void;
}

export function useBoardOperations({ repoPath, onBoardsChange }: UseBoardOperationsProps) {
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardIcon, setNewBoardIcon] = useState("");
  const [editingBoard, setEditingBoard] = useState<KanbanBoard | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  // Create a new board
  const handleCreateBoard = useCallback(async (): Promise<boolean> => {
    if (!repoPath || !newBoardName.trim()) {
      console.log("Cannot create board - missing repoPath or board name");
      return false;
    }

    console.log("Creating board:", { name: newBoardName, icon: newBoardIcon });

    const boardId = newBoardName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newBoard = createDefaultBoard();
    newBoard.id = boardId;
    newBoard.name = newBoardName;
    newBoard.icon = newBoardIcon || undefined;

    console.log("Board data:", newBoard);

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      await kanbanRepo.saveBoard(newBoard);

      console.log("Board created successfully");
      setNewBoardName("");
      setNewBoardIcon("");
      onBoardsChange();
      return true;
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to create board:", error.message);
        alert(`Failed to create board: ${error.message}`);
      } else {
        console.error("Failed to create board:", error);
        alert(`Error creating board: ${error}`);
      }
      return false;
    }
  }, [repoPath, newBoardName, newBoardIcon, onBoardsChange]);

  // Update an existing board
  const handleUpdateBoard = useCallback(async (): Promise<boolean> => {
    if (!repoPath || !editingBoard || !editName.trim()) return false;

    const updatedBoard = {
      ...editingBoard,
      name: editName,
      icon: editIcon || undefined,
      updatedAt: new Date().toISOString(),
    };

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      await kanbanRepo.saveBoard(updatedBoard);

      setEditingBoard(null);
      onBoardsChange();
      return true;
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to update board:", error.message);
      } else {
        console.error("Failed to update board:", error);
      }
      return false;
    }
  }, [repoPath, editingBoard, editName, editIcon, onBoardsChange]);

  // Delete a board
  const handleDeleteBoard = useCallback(async (boardId: string, totalBoards: number): Promise<boolean> => {
    if (!repoPath || totalBoards <= 1) return false;

    if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      return false;
    }

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      await kanbanRepo.deleteBoard(boardId);

      onBoardsChange();
      return true;
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to delete board:", error.message);
      } else {
        console.error("Failed to delete board:", error);
      }
      return false;
    }
  }, [repoPath, onBoardsChange]);

  // Start editing a board
  const handleEditBoard = useCallback((board: KanbanBoard) => {
    setEditingBoard(board);
    setEditName(board.name);
    setEditIcon(board.icon || "");
  }, []);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingBoard(null);
  }, []);

  return {
    // Create board state
    newBoardName,
    setNewBoardName,
    newBoardIcon,
    setNewBoardIcon,

    // Edit board state
    editingBoard,
    editName,
    setEditName,
    editIcon,
    setEditIcon,

    // Operations
    handleCreateBoard,
    handleUpdateBoard,
    handleDeleteBoard,
    handleEditBoard,
    handleCancelEdit,
  };
}
