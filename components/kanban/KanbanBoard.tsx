"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  KanbanBoard as KanbanBoardType,
  KanbanCard as KanbanCardType,
  createCard,
  createDefaultBoard,
  isWipLimitReached,
} from "@/lib/kanban/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function KanbanBoard() {
  const [board, setBoard] = useState<KanbanBoardType>(createDefaultBoard());
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardColumn, setNewCardColumn] = useState("todo");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );
    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cards.some((card) => card.id === overId)
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    // Check WIP limit before allowing move
    if (isWipLimitReached(overColumn)) {
      return;
    }

    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
      }));

      const activeColIndex = newColumns.findIndex((col) => col.id === activeColumn.id);
      const overColIndex = newColumns.findIndex((col) => col.id === overColumn.id);

      const activeCardIndex = newColumns[activeColIndex].cards.findIndex(
        (card) => card.id === activeId
      );
      const [card] = newColumns[activeColIndex].cards.splice(activeCardIndex, 1);

      newColumns[overColIndex].cards.push(card);

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
  };

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;

    const card = createCard(newCardTitle, newCardDescription || undefined);

    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => {
        if (col.id === newCardColumn) {
          return {
            ...col,
            cards: [...col.cards, card],
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

    setNewCardTitle("");
    setNewCardDescription("");
    setIsDialogOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      }));

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{board.name}</h2>
          <p className="text-sm text-muted-foreground">
            Drag cards between columns • WIP limits enforced
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Create a new card for your Kanban board
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-title">Title</Label>
                <Input
                  id="card-title"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-description">Description (optional)</Label>
                <Input
                  id="card-description"
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  placeholder="Enter description..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-column">Column</Label>
                <select
                  id="card-column"
                  value={newCardColumn}
                  onChange={(e) => setNewCardColumn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {board.columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCard} disabled={!newCardTitle.trim()}>
                Add Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onDeleteCard={handleDeleteCard}
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
}
