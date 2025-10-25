/**
 * Hook for managing add card form state and logic
 * Handles title, description, and column selection
 */

import { useState, useCallback } from "react";
import { KanbanBoard } from "@/lib/kanban/types";

interface UseAddCardParams {
  onAddCard: (title: string, description: string | undefined, columnId: string) => void;
  onOpenChange: (open: boolean) => void;
  columns: KanbanBoard["columns"];
}

interface UseAddCardReturn {
  newCardTitle: string;
  setNewCardTitle: (value: string) => void;
  newCardDescription: string;
  setNewCardDescription: (value: string) => void;
  newCardColumn: string;
  setNewCardColumn: (value: string) => void;
  handleAddCard: () => void;
}

export function useAddCard({
  onAddCard,
  onOpenChange,
  columns,
}: UseAddCardParams): UseAddCardReturn {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardColumn, setNewCardColumn] = useState(columns[0]?.id || "todo");

  const handleAddCard = useCallback(() => {
    if (!newCardTitle.trim()) return;

    onAddCard(newCardTitle, newCardDescription || undefined, newCardColumn);

    // Reset form
    setNewCardTitle("");
    setNewCardDescription("");
    onOpenChange(false);
  }, [newCardTitle, newCardDescription, newCardColumn, onAddCard, onOpenChange]);

  return {
    newCardTitle,
    setNewCardTitle,
    newCardDescription,
    setNewCardDescription,
    newCardColumn,
    setNewCardColumn,
    handleAddCard,
  };
}
