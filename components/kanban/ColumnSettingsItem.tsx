/**
 * Individual column settings form item
 * Handles display and editing of a single column's configuration
 */

import { memo } from "react";
import { KanbanBoard } from "@/lib/kanban/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

type KanbanColumn = KanbanBoard["columns"][0];

interface ColumnSettingsItemProps {
  column: KanbanColumn;
  index: number;
  canDelete: boolean;
  isLast: boolean;
  onDelete: () => void;
  onUpdate: (updates: Partial<KanbanColumn>) => void;
}

export const ColumnSettingsItem = memo(function ColumnSettingsItem({
  column,
  index,
  canDelete,
  isLast,
  onDelete,
  onUpdate,
}: ColumnSettingsItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Column {index + 1}</h3>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
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
            onChange={(e) => onUpdate({ title: e.target.value })}
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
              onUpdate({
                wipLimit: e.target.value ? parseInt(e.target.value) : undefined,
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
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={column.color || "#64748b"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {!isLast && <Separator className="mt-4" />}
    </div>
  );
});
