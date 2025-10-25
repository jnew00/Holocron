"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";

interface HeadingButtonsProps {
  editor: Editor;
}

export const HeadingButtons = React.memo(({ editor }: HeadingButtonsProps) => (
  <ToolbarGroup>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      active={editor.isActive("heading", { level: 1 })}
      title="Heading 1"
    >
      <Heading1 className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      active={editor.isActive("heading", { level: 2 })}
      title="Heading 2"
    >
      <Heading2 className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      active={editor.isActive("heading", { level: 3 })}
      title="Heading 3"
    >
      <Heading3 className="h-4 w-4" />
    </ToolbarButton>
  </ToolbarGroup>
));

HeadingButtons.displayName = "HeadingButtons";
