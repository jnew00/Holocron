/**
 * Custom hook for kanban board drag-and-drop functionality
 * Manages drag state and handles drag events using dnd-kit
 */

import { useState, useCallback } from "react";
import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  KanbanBoard,
  KanbanCard,
} from "@/lib/kanban/types";

interface UseKanbanDragDropProps {
  board: KanbanBoard;
  setBoard: (updater: (prev: KanbanBoard) => KanbanBoard) => void;
}

export function useKanbanDragDrop({ board, setBoard }: UseKanbanDragDropProps) {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  // Configure drag sensors with activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start - set active card
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const card = board.columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    setActiveCard(card || null);
  }, [board.columns]);

  // Handle drag over - move card between columns
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setBoard((prev) => {
      // Find columns using the current state, not stale board reference
      const activeColumn = prev.columns.find((col) =>
        col.cards.some((card) => card.id === activeId)
      );
      const overColumn = prev.columns.find(
        (col) => col.id === overId || col.cards.some((card) => card.id === overId)
      );

      if (!activeColumn || !overColumn) return prev;
      if (activeColumn.id === overColumn.id) return prev;

      // Note: WIP limit is shown as a visual warning only, not enforced

      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
      }));

      const activeColIndex = newColumns.findIndex((col) => col.id === activeColumn.id);
      const overColIndex = newColumns.findIndex((col) => col.id === overColumn.id);

      // Safety check
      if (activeColIndex === -1 || overColIndex === -1) return prev;

      const activeCardIndex = newColumns[activeColIndex].cards.findIndex(
        (card) => card.id === activeId
      );

      // Safety check
      if (activeCardIndex === -1) return prev;

      const [card] = newColumns[activeColIndex].cards.splice(activeCardIndex, 1);
      newColumns[overColIndex].cards.push(card);

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [setBoard]);

  // Handle drag end - reorder within column if needed
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );

    if (!activeColumn) return;

    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cards.some((card) => card.id === overId)
    );

    if (!overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // Reordering within same column
      const oldIndex = activeColumn.cards.findIndex((card) => card.id === activeId);
      const newIndex = activeColumn.cards.findIndex((card) => card.id === overId);

      if (oldIndex !== newIndex) {
        setBoard((prev) => {
          const newColumns = prev.columns.map((col) => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                cards: arrayMove(col.cards, oldIndex, newIndex),
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
      }
    }
  }, [board.columns, setBoard]);

  return {
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
