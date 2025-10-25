"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from "@/lib/kanban/types";
import { KanbanCard } from "./KanbanCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Archive } from "lucide-react";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onDeleteCard: (cardId: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<KanbanCardType>) => void;
  onArchiveColumn?: () => void;
}

export function KanbanColumn({ column, onDeleteCard, onUpdateCard, onArchiveColumn }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const isWipLimitReached = column.wipLimit && column.cards.length > column.wipLimit;
  const isWipLimitAtLimit = column.wipLimit && column.cards.length === column.wipLimit;
  const isWipLimitWarning = column.wipLimit && column.cards.length === column.wipLimit - 1;
  const isDoneColumn = column.title.toLowerCase() === "done";
  const hasCards = column.cards.length > 0;

  return (
    <Card className={`w-full overflow-hidden ${
      isWipLimitReached ? "border-2 border-destructive bg-destructive/10" : ""
    }`}>
      <CardHeader className={`pb-3 ${
        isWipLimitReached ? "bg-destructive/15" : ""
      }`}>
        <div className="flex items-center justify-between mb-2">
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
                    ? "text-destructive font-bold"
                    : isWipLimitAtLimit
                    ? "text-amber-500 font-medium"
                    : isWipLimitWarning
                    ? "text-amber-500"
                    : ""
                }
              >
                WIP: {column.cards.length}/{column.wipLimit}
              </span>
            </div>
          )}
        </div>
        {isDoneColumn && hasCards && onArchiveColumn && (
          <Button
            variant="outline"
            size="sm"
            onClick={onArchiveColumn}
            className="w-full text-xs"
          >
            <Archive className="h-3 w-3 mr-1" />
            Archive All ({column.cards.length})
          </Button>
        )}
      </CardHeader>
      <CardContent className="overflow-x-hidden">
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={`min-h-[200px] transition-colors overflow-x-hidden ${
              isOver ? "bg-muted/50 rounded-lg" : ""
            }`}
          >
            {column.cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onDelete={onDeleteCard}
                onUpdate={onUpdateCard}
              />
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
