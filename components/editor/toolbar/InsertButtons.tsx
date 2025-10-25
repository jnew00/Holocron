"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Link as LinkIcon, Table } from "lucide-react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";

interface InsertButtonsProps {
  editor: Editor;
}

export const InsertButtons = React.memo(({ editor }: InsertButtonsProps) => (
  <ToolbarGroup>
    <ToolbarButton
      onClick={() => {
        const url = window.prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }}
      active={editor.isActive("link")}
      title="Link"
    >
      <LinkIcon className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      }
      title="Insert Table"
    >
      <Table className="h-4 w-4" />
    </ToolbarButton>
  </ToolbarGroup>
));

InsertButtons.displayName = "InsertButtons";
