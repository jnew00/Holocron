"use client";

import { memo } from "react";
import { NotesSidebar } from "@/components/notes/NotesSidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";

interface SidebarContainerProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isFullscreen: boolean;
  currentNoteId: string | null;
  onSelectNote: (notePath: string) => void;
  onNewNote: () => void;
  onArchiveNote: (notePath: string) => void;
  onDeleteNote: (notePath: string) => void;
  refreshTrigger: number;
}

export const SidebarContainer = memo(function SidebarContainer({
  isCollapsed,
  onCollapse,
  isFullscreen,
  currentNoteId,
  onSelectNote,
  onNewNote,
  onArchiveNote,
  onDeleteNote,
  refreshTrigger,
}: SidebarContainerProps) {
  // Don't render anything in fullscreen mode
  if (isFullscreen) {
    return null;
  }

  // Render collapsed toggle button
  if (isCollapsed) {
    return (
      <div className="border-r bg-muted/30 flex flex-col items-center py-4 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(false)}
          title="Show sidebar"
          className="h-8 w-8 p-0"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Render full sidebar
  return (
    <NotesSidebar
      currentNoteId={currentNoteId}
      onSelectNote={onSelectNote}
      onNewNote={onNewNote}
      onArchiveNote={onArchiveNote}
      onDeleteNote={onDeleteNote}
      onCollapse={() => onCollapse(true)}
      refreshTrigger={refreshTrigger}
    />
  );
});
