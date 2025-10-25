"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Quote, Minus } from "lucide-react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";

interface BlockButtonsProps {
  editor: Editor;
}

export const BlockButtons = React.memo(({ editor }: BlockButtonsProps) => (
  <ToolbarGroup>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      active={editor.isActive("blockquote")}
      title="Blockquote"
    >
      <Quote className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
      title="Horizontal Rule"
    >
      <Minus className="h-4 w-4" />
    </ToolbarButton>
  </ToolbarGroup>
));

BlockButtons.displayName = "BlockButtons";
