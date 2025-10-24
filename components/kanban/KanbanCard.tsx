"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard as KanbanCardType } from "@/lib/kanban/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanCardProps {
  card: KanbanCardType;
  onDelete: (cardId: string) => void;
}

export function KanbanCard({ card, onDelete }: KanbanCardProps) {
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
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div {...attributes} {...listeners} className="cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm font-medium truncate">
                {card.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(card.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        {(card.description || card.priority || card.tags) && (
          <CardContent className="p-3 pt-0">
            {card.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {card.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {card.priority && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    priorityColors[card.priority]
                  }`}
                >
                  {card.priority}
                </span>
              )}
              {card.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
