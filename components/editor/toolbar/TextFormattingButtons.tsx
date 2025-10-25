"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  FileCode,
  Underline as UnderlineIcon,
  Highlighter,
} from "lucide-react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";

interface TextFormattingButtonsProps {
  editor: Editor;
}

export const TextFormattingButtons = React.memo(({ editor }: TextFormattingButtonsProps) => (
  <ToolbarGroup>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBold().run()}
      active={editor.isActive("bold")}
      title="Bold"
    >
      <Bold className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleItalic().run()}
      active={editor.isActive("italic")}
      title="Italic"
    >
      <Italic className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleStrike().run()}
      active={editor.isActive("strike")}
      title="Strikethrough"
    >
      <Strikethrough className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleCode().run()}
      active={editor.isActive("code")}
      title="Inline Code"
    >
      <Code className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      active={editor.isActive("codeBlock")}
      title="Code Block"
    >
      <FileCode className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      active={editor.isActive("underline")}
      title="Underline"
    >
      <UnderlineIcon className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHighlight().run()}
      active={editor.isActive("highlight")}
      title="Highlight"
    >
      <Highlighter className="h-4 w-4" />
    </ToolbarButton>
  </ToolbarGroup>
));

TextFormattingButtons.displayName = "TextFormattingButtons";
