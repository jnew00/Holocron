"use client";

import { memo } from "react";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { FileText } from "lucide-react";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";

interface NoteEditorContainerProps {
  markdown: string;
  onChange: (markdown: string) => void;
  hasNote: boolean;
  kanbanBoards: KanbanBoardType[];
}

export const NoteEditorContainer = memo(function NoteEditorContainer({
  markdown,
  onChange,
  hasNote,
  kanbanBoards,
}: NoteEditorContainerProps) {
  if (!hasNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg mb-2">No note selected</p>
        <p className="text-sm">
          Select a note from the sidebar or create a new one
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0">
      <TiptapEditor
        content={markdown}
        onChange={onChange}
        placeholder="Start writing your note..."
        kanbanBoards={kanbanBoards}
      />
    </div>
  );
});
