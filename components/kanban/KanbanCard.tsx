"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard as KanbanCardType } from "@/lib/kanban/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Trash2, Calendar, Tag, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KanbanCardProps {
  card: KanbanCardType;
  onDelete: (cardId: string) => void;
  onUpdate?: (cardId: string, updates: Partial<KanbanCardType>) => void;
}

export function KanbanCard({ card, onDelete, onUpdate }: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | undefined>(card.priority);
  const [editTags, setEditTags] = useState<string[]>(card.tags || []);
  const [newTag, setNewTag] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const handleSave = () => {
    if (!onUpdate || !editTitle.trim()) return;

    onUpdate(card.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      tags: editTags.length > 0 ? editTags : undefined,
      updatedAt: new Date().toISOString(),
    });

    setIsExpanded(false);
  };

  const handleAddTag = () => {
    if (!newTag.trim() || editTags.includes(newTag.trim())) return;
    setEditTags([...editTags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  const handleOpen = (open: boolean) => {
    if (open) {
      // Reset edit state when opening
      setEditTitle(card.title);
      setEditDescription(card.description || '');
      setEditPriority(card.priority);
      setEditTags(card.tags || []);
      setNewTag('');
    }
    setIsExpanded(open);
  };

  const handleCardDoubleClick = () => {
    setIsExpanded(true);
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full">
        <Card
          className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow w-full overflow-hidden"
          onDoubleClick={handleCardDoubleClick}
        >
          <CardHeader className="p-3 pb-2 overflow-hidden">
            <div className="flex items-start justify-between gap-2 overflow-hidden">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mr-1" />
                <CardTitle
                  className="text-sm font-medium overflow-hidden break-words"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                  title="Double-click to edit"
                >
                  {card.title}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          {(card.description || card.priority || card.tags) && (
            <CardContent className="p-3 pt-0 overflow-hidden w-full">
              {card.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2 overflow-hidden break-words w-full"
                   style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                  {card.description}
                </p>
              )}
              <div className="flex items-start gap-2 flex-wrap w-full">
                {card.priority && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      priorityColors[card.priority]
                    }`}
                  >
                    {card.priority}
                  </span>
                )}
                {card.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted overflow-hidden text-ellipsis whitespace-nowrap max-w-full block"
                    title={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Dialog open={isExpanded} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update card details and metadata
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Card title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Card description..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <select
                id="edit-priority"
                value={editPriority || ''}
                onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high' || undefined)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              {card.createdAt && (
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created
                  </Label>
                  <p className="text-sm mt-1">
                    {new Date(card.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {card.updatedAt && (
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last Updated
                  </Label>
                  <p className="text-sm mt-1">
                    {new Date(card.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpanded(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!editTitle.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
