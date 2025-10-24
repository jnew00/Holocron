"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn as KanbanColumnType } from "@/lib/kanban/types";
import { KanbanCard } from "./KanbanCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onDeleteCard: (cardId: string) => void;
}

export function KanbanColumn({ column, onDeleteCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const isWipLimitReached = column.wipLimit && column.cards.length >= column.wipLimit;
  const isWipLimitWarning = column.wipLimit && column.cards.length === column.wipLimit - 1;

  return (
    <Card className="flex-shrink-0 w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <CardTitle className="text-sm font-semibold">
              {column.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {column.cards.length}
            </Badge>
          </div>
          {column.wipLimit && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isWipLimitReached && (
                <AlertCircle className="h-3 w-3 text-destructive" />
              )}
              <span
                className={
                  isWipLimitReached
                    ? "text-destructive font-medium"
                    : isWipLimitWarning
                    ? "text-amber-500 font-medium"
                    : ""
                }
              >
                WIP: {column.cards.length}/{column.wipLimit}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={`min-h-[200px] transition-colors ${
              isOver ? "bg-muted/50 rounded-lg" : ""
            }`}
          >
            {column.cards.map((card) => (
              <KanbanCard key={card.id} card={card} onDelete={onDeleteCard} />
            ))}
            {column.cards.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Drop cards here
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}
