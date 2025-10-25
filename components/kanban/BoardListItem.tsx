/**
 * Board list item component
 * Displays a board in the manage boards list with edit/delete actions
 */

import { memo } from "react";
import { KanbanBoard } from "@/lib/kanban/types";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, LayoutDashboard } from "lucide-react";

interface BoardListItemProps {
  board: KanbanBoard;
  onEdit: (board: KanbanBoard) => void;
  onDelete: (boardId: string) => void;
  canDelete: boolean;
}

export const BoardListItem = memo(function BoardListItem({
  board,
  onEdit,
  onDelete,
  canDelete,
}: BoardListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50">
      <div className="flex items-center gap-3">
        {board.icon ? (
          board.icon.startsWith('data:') ? (
            <img src={board.icon} alt={board.name} className="h-6 w-6 rounded" />
          ) : (
            <span className="text-lg">{board.icon}</span>
          )
        ) : (
          <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <span className="text-sm font-medium">{board.name}</span>
          <p className="text-xs text-muted-foreground">ID: {board.id}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(board)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(board.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});
