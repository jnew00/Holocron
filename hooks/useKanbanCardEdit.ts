"use client";

import { useState, useCallback } from "react";
import { KanbanCard } from "@/lib/kanban/types";

interface UseKanbanCardEditProps {
  card: KanbanCard;
  onUpdate?: (cardId: string, updates: Partial<KanbanCard>) => void;
}

interface UseKanbanCardEditReturn {
  isExpanded: boolean;
  editTitle: string;
  setEditTitle: (title: string) => void;
  editDescription: string;
  setEditDescription: (description: string) => void;
  editPriority: 'low' | 'medium' | 'high' | undefined;
  setEditPriority: (priority: 'low' | 'medium' | 'high' | undefined) => void;
  editTags: string[];
  newTag: string;
  setNewTag: (tag: string) => void;
  handleSave: () => void;
  handleAddTag: () => void;
  handleRemoveTag: (tagToRemove: string) => void;
  handleOpen: (open: boolean) => void;
  handleCardDoubleClick: () => void;
}

export function useKanbanCardEdit({ card, onUpdate }: UseKanbanCardEditProps): UseKanbanCardEditReturn {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | undefined>(card.priority);
  const [editTags, setEditTags] = useState<string[]>(card.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleSave = useCallback(() => {
    if (!onUpdate || !editTitle.trim()) return;

    onUpdate(card.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      tags: editTags.length > 0 ? editTags : undefined,
      updatedAt: new Date().toISOString(),
    });

    setIsExpanded(false);
  }, [onUpdate, editTitle, editDescription, editPriority, editTags, card.id]);

  const handleAddTag = useCallback(() => {
    if (!newTag.trim() || editTags.includes(newTag.trim())) return;
    setEditTags([...editTags, newTag.trim()]);
    setNewTag('');
  }, [newTag, editTags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  }, [editTags]);

  const handleOpen = useCallback((open: boolean) => {
    if (open) {
      // Reset edit state when opening
      setEditTitle(card.title);
      setEditDescription(card.description || '');
      setEditPriority(card.priority);
      setEditTags(card.tags || []);
      setNewTag('');
    }
    setIsExpanded(open);
  }, [card.title, card.description, card.priority, card.tags]);

  const handleCardDoubleClick = useCallback(() => {
    setIsExpanded(true);
  }, []);

  return {
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
  };
}
