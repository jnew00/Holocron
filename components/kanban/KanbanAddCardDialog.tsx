/**
 * Dialog component for adding new kanban cards
 * Handles title, description, and column selection
 */

import { memo } from "react";
import { KanbanBoard } from "@/lib/kanban/types";
import { Button } from "@/components/ui/button";
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
import { useAddCard } from "@/hooks/useAddCard";
import { AddCardForm } from "./AddCardForm";

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
  const {
    newCardTitle,
    setNewCardTitle,
    newCardDescription,
    setNewCardDescription,
    newCardColumn,
    setNewCardColumn,
    handleAddCard,
  } = useAddCard({ onAddCard, onOpenChange, columns });

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
        <AddCardForm
          newCardTitle={newCardTitle}
          setNewCardTitle={setNewCardTitle}
          newCardDescription={newCardDescription}
          setNewCardDescription={setNewCardDescription}
          newCardColumn={newCardColumn}
          setNewCardColumn={setNewCardColumn}
          columns={columns}
        />
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
