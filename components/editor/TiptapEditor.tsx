"use client";

import { EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { useTiptapEditor } from "@/hooks/useTiptapEditor";
import { KanbanBoard } from "@/lib/kanban/types";

interface TiptapEditorProps {
  content?: string;
  onChange?: (markdown: string) => void;
  placeholder?: string;
  editable?: boolean;
  kanbanBoards?: KanbanBoard[];
}

export function TiptapEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  editable = true,
  kanbanBoards = [],
}: TiptapEditorProps) {
  const editor = useTiptapEditor({
    content,
    onChange,
    placeholder,
    editable,
    kanbanBoards,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-background flex flex-col h-full overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
