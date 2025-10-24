"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useEffect } from "react";
import { jsonToMarkdown, markdownToJson } from "@/lib/markdown/converter";
import { EditorToolbar } from "./EditorToolbar";

interface TiptapEditorProps {
  content?: string;
  onChange?: (markdown: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function TiptapEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-muted p-4 rounded-lg font-mono text-sm",
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
    content: content ? markdownToJson(content) : undefined,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = editor.getJSON();
        const markdown = jsonToMarkdown(json);
        onChange(markdown);
      }
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMarkdown = jsonToMarkdown(editor.getJSON());
      if (currentMarkdown.trim() !== content.trim()) {
        editor.commands.setContent(markdownToJson(content));
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
