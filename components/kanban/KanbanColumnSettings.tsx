/**
 * Dialog component for managing kanban board columns
 * Allows adding, editing, and deleting columns with WIP limits and colors
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
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ColumnSettingsItem } from "./ColumnSettingsItem";

type KanbanColumn = KanbanBoard["columns"][0];

interface KanbanColumnSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: KanbanColumn[];
  editingColumns: KanbanColumn[];
  onEditingColumnsChange: (columns: KanbanColumn[]) => void;
  onSave: () => void;
  onAddColumn: () => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void;
}

export const KanbanColumnSettings = memo(function KanbanColumnSettings({
  open,
  onOpenChange,
  editingColumns,
  onSave,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
}: KanbanColumnSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Kanban Board</DialogTitle>
          <DialogDescription>
            Manage columns, set WIP limits, and customize your board
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 py-4">
          {editingColumns.map((column, index) => (
            <ColumnSettingsItem
              key={column.id}
              column={column}
              index={index}
              canDelete={editingColumns.length > 1}
              isLast={index === editingColumns.length - 1}
              onDelete={() => onDeleteColumn(column.id)}
              onUpdate={(updates) => onUpdateColumn(column.id, updates)}
            />
          ))}

          <Button
            variant="outline"
            onClick={onAddColumn}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Column
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
