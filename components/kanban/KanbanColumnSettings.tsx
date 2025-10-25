/**
 * Dialog component for managing kanban board columns
 * Allows adding, editing, and deleting columns with WIP limits and colors
 */

import { memo } from "react";
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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";

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
            <div key={column.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Column {index + 1}</h3>
                {editingColumns.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteColumn(column.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`col-title-${column.id}`}>Column Title</Label>
                  <Input
                    id={`col-title-${column.id}`}
                    value={column.title}
                    onChange={(e) =>
                      onUpdateColumn(column.id, { title: e.target.value })
                    }
                    placeholder="Column title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`col-wip-${column.id}`}>
                    WIP Limit (optional)
                  </Label>
                  <Input
                    id={`col-wip-${column.id}`}
                    type="number"
                    min="0"
                    value={column.wipLimit || ""}
                    onChange={(e) =>
                      onUpdateColumn(column.id, {
                        wipLimit: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="No limit"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum cards allowed in this column
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`col-color-${column.id}`}>Column Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`col-color-${column.id}`}
                      type="color"
                      value={column.color || "#64748b"}
                      onChange={(e) =>
                        onUpdateColumn(column.id, { color: e.target.value })
                      }
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={column.color || "#64748b"}
                      onChange={(e) =>
                        onUpdateColumn(column.id, { color: e.target.value })
                      }
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {index < editingColumns.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
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
