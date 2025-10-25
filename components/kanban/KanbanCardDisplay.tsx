"use client";

import React from "react";
import { KanbanCard as KanbanCardType } from "@/lib/kanban/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanCardDisplayProps {
  card: KanbanCardType;
  onDelete: (cardId: string) => void;
  onDoubleClick: () => void;
  dragHandlers: {
    attributes: any;
    listeners: any;
    setNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
  };
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const KanbanCardDisplay = React.memo(function KanbanCardDisplay({
  card,
  onDelete,
  onDoubleClick,
  dragHandlers,
}: KanbanCardDisplayProps) {
  const { attributes, listeners, setNodeRef, style } = dragHandlers;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full">
      <Card
        className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow w-full overflow-hidden"
        onDoubleClick={onDoubleClick}
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
  );
});
