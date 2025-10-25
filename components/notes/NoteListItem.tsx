import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Trash2, ArchiveRestore } from "lucide-react";

interface NoteListItemProps {
  title: string;
  modified: string;
  path: string;
  isArchived: boolean;
  isSelected: boolean;
  formatDate: (date: string) => string;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const NoteListItem = React.memo(function NoteListItem({
  title,
  modified,
  path,
  isArchived,
  isSelected,
  formatDate,
  onSelect,
  onArchive,
  onDelete,
}: NoteListItemProps) {
  return (
    <div
      className={`p-2 mx-1 rounded-md cursor-pointer hover:bg-muted transition-colors ${
        isSelected ? "bg-muted" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate mb-0.5">
            {title || "Untitled"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatDate(modified)}
          </p>
        </div>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            title={isArchived ? "Unarchive" : "Archive"}
          >
            {isArchived ? (
              <ArchiveRestore className="h-3 w-3" />
            ) : (
              <Archive className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {isArchived && (
        <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          Archived
        </span>
      )}
    </div>
  );
});
