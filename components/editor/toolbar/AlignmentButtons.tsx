"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";

interface AlignmentButtonsProps {
  editor: Editor;
}

export const AlignmentButtons = React.memo(({ editor }: AlignmentButtonsProps) => (
  <ToolbarGroup showDivider={false}>
    <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign("left").run()}
      active={editor.isActive({ textAlign: "left" })}
      title="Align Left"
    >
      <AlignLeft className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign("center").run()}
      active={editor.isActive({ textAlign: "center" })}
      title="Align Center"
    >
      <AlignCenter className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign("right").run()}
      active={editor.isActive({ textAlign: "right" })}
      title="Align Right"
    >
      <AlignRight className="h-4 w-4" />
    </ToolbarButton>
  </ToolbarGroup>
));

AlignmentButtons.displayName = "AlignmentButtons";
