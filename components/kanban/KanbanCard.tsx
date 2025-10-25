"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard as KanbanCardType } from "@/lib/kanban/types";
import { useKanbanCardEdit } from "@/hooks/useKanbanCardEdit";
import { KanbanCardDisplay } from "./KanbanCardDisplay";
import { KanbanCardDialog } from "./KanbanCardDialog";

interface KanbanCardProps {
  card: KanbanCardType;
  onDelete: (cardId: string) => void;
  onUpdate?: (cardId: string, updates: Partial<KanbanCardType>) => void;
}

export function KanbanCard({ card, onDelete, onUpdate }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const {
    isExpanded,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editPriority,
    setEditPriority,
    editTags,
    newTag,
    setNewTag,
    handleSave,
    handleAddTag,
    handleRemoveTag,
    handleOpen,
    handleCardDoubleClick,
  } = useKanbanCardEdit({ card, onUpdate });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <>
      <KanbanCardDisplay
        card={card}
        onDelete={onDelete}
        onDoubleClick={handleCardDoubleClick}
        dragHandlers={{ attributes, listeners, setNodeRef, style }}
      />
      <KanbanCardDialog
        isExpanded={isExpanded}
        onOpenChange={handleOpen}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editPriority={editPriority}
        setEditPriority={setEditPriority}
        editTags={editTags}
        newTag={newTag}
        setNewTag={setNewTag}
        handleAddTag={handleAddTag}
        handleRemoveTag={handleRemoveTag}
        handleSave={handleSave}
        card={card}
      />
    </>
  );
}
