/**
 * Main kanban board view component
 * Renders the board with drag-and-drop functionality
 */

import { memo } from "react";
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import { KanbanBoard, KanbanCard as KanbanCardType } from "@/lib/kanban/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw } from "lucide-react";

interface KanbanBoardViewProps {
  board: KanbanBoard;
  activeCard: KanbanCardType | null;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<KanbanCardType>) => void;
  onArchiveDoneColumn: (columnId: string) => void;
  onOpenSettings: () => void;
  onOpenAddCard: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const KanbanBoardView = memo(function KanbanBoardView({
  board,
  activeCard,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDeleteCard,
  onUpdateCard,
  onArchiveDoneColumn,
  onOpenSettings,
  onOpenAddCard,
  onSync,
  isSyncing,
}: KanbanBoardViewProps) {
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Drag cards between columns • WIP limits enforced
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from Notes'}
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Board
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onDeleteCard={onDeleteCard}
              onUpdateCard={onUpdateCard}
              onArchiveColumn={
                column.title.toLowerCase() === "done"
                  ? () => onArchiveDoneColumn(column.id)
                  : undefined
              }
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard card={activeCard} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
});
