/**
 * Form fields for adding a new kanban card
 * Handles title, description, and column selection inputs
 */

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KanbanBoard } from "@/lib/kanban/types";

interface AddCardFormProps {
  newCardTitle: string;
  setNewCardTitle: (value: string) => void;
  newCardDescription: string;
  setNewCardDescription: (value: string) => void;
  newCardColumn: string;
  setNewCardColumn: (value: string) => void;
  columns: KanbanBoard["columns"];
}

export const AddCardForm = memo(function AddCardForm({
  newCardTitle,
  setNewCardTitle,
  newCardDescription,
  setNewCardDescription,
  newCardColumn,
  setNewCardColumn,
  columns,
}: AddCardFormProps) {
  return (
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
  );
});
