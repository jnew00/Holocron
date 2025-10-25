"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Undo, Redo } from "lucide-react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";

interface UndoRedoButtonsProps {
  editor: Editor;
}

export const UndoRedoButtons = React.memo(({ editor }: UndoRedoButtonsProps) => (
  <ToolbarGroup>
    <ToolbarButton
      onClick={() => editor.chain().focus().undo().run()}
      disabled={!editor.can().undo()}
      title="Undo"
    >
      <Undo className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().redo().run()}
      disabled={!editor.can().redo()}
      title="Redo"
    >
      <Redo className="h-4 w-4" />
    </ToolbarButton>
  </ToolbarGroup>
));

UndoRedoButtons.displayName = "UndoRedoButtons";
