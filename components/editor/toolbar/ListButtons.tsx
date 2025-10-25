"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { List, ListOrdered, ListTodo } from "lucide-react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarGroup } from "../ToolbarGroup";

interface ListButtonsProps {
  editor: Editor;
}

export const ListButtons = React.memo(({ editor }: ListButtonsProps) => (
  <ToolbarGroup>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      active={editor.isActive("bulletList")}
      title="Bullet List"
    >
      <List className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      active={editor.isActive("orderedList")}
      title="Numbered List"
    >
      <ListOrdered className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleTaskList().run()}
      active={editor.isActive("taskList")}
      title="Task List"
    >
      <ListTodo className="h-4 w-4" />
    </ToolbarButton>
  </ToolbarGroup>
));

ListButtons.displayName = "ListButtons";
