"use client";

import { Editor } from "@tiptap/react";
import { UndoRedoButtons } from "./toolbar/UndoRedoButtons";
import { TextFormattingButtons } from "./toolbar/TextFormattingButtons";
import { HeadingButtons } from "./toolbar/HeadingButtons";
import { ListButtons } from "./toolbar/ListButtons";
import { BlockButtons } from "./toolbar/BlockButtons";
import { InsertButtons } from "./toolbar/InsertButtons";
import { AlignmentButtons } from "./toolbar/AlignmentButtons";

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
      <UndoRedoButtons editor={editor} />
      <TextFormattingButtons editor={editor} />
      <HeadingButtons editor={editor} />
      <ListButtons editor={editor} />
      <BlockButtons editor={editor} />
      <InsertButtons editor={editor} />
      <AlignmentButtons editor={editor} />
    </div>
  );
}
