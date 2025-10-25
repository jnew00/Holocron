/**
 * Dialog component for adding new kanban cards
 * Handles title, description, and column selection
 */

import { memo, useState } from "react";
import { KanbanBoard } from "@/lib/kanban/types";
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

interface KanbanAddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (title: string, description: string | undefined, columnId: string) => void;
  columns: KanbanBoard["columns"];
}

export const KanbanAddCardDialog = memo(function KanbanAddCardDialog({
  open,
  onOpenChange,
  onAddCard,
  columns,
}: KanbanAddCardDialogProps) {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardColumn, setNewCardColumn] = useState(columns[0]?.id || "todo");

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;

    onAddCard(newCardTitle, newCardDescription || undefined, newCardColumn);

    // Reset form
    setNewCardTitle("");
    setNewCardDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCard} disabled={!newCardTitle.trim()}>
            Add Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
