import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, FolderTree } from "lucide-react";
import { SortBy } from "@/hooks/useNotesSidebar";

interface NoteSortDropdownProps {
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
}

export const NoteSortDropdown = React.memo(function NoteSortDropdown({
  sortBy,
  onSortChange,
}: NoteSortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Sort by"
        >
          {sortBy === "time" ? (
            <Clock className="h-4 w-4" />
          ) : (
            <FolderTree className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSortChange("time")}>
          <Clock className="h-4 w-4 mr-2" />
          Sort by Time
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange("type")}>
          <FolderTree className="h-4 w-4 mr-2" />
          Sort by Type
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
