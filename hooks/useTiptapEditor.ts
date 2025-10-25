import { useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { createTiptapExtensions } from "@/lib/editor/tiptapExtensions";
import { KanbanBoard } from "@/lib/kanban/types";
import type { Editor } from "@tiptap/react";

interface UseTiptapEditorParams {
  content: string;
  onChange?: (markdown: string) => void;
  placeholder: string;
  editable: boolean;
  kanbanBoards: KanbanBoard[];
}

export function useTiptapEditor({
  content,
  onChange,
  placeholder,
  editable,
  kanbanBoards,
}: UseTiptapEditorParams): Editor | null {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createTiptapExtensions({
      placeholder,
      kanbanBoards,
    }),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        // Get markdown from the editor using the extension's serializer
        const storage = editor.storage as any;
        const markdown = storage.markdown?.getMarkdown?.() || "";
        onChange(markdown);
      }
    },
  }, [kanbanBoards]); // Recreate editor when kanban boards change

  // Update editor content when prop changes (but not while user is typing)
  useEffect(() => {
    if (editor && content !== undefined) {
      const storage = editor.storage as any;
      const currentMarkdown = storage.markdown?.getMarkdown?.() || "";

      // Don't update if content is the same or if editor is focused (user is typing)
      if (currentMarkdown.trim() !== content.trim() && !editor.isFocused) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  return editor;
}
