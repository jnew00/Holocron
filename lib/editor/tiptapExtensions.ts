import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Mention } from "@tiptap/extension-mention";
import { Markdown } from "tiptap-markdown";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { all, createLowlight } from "lowlight";
import { CodeBlockComponent } from "@/components/editor/CodeBlockComponent";
import { KanbanBoard } from "@/lib/kanban/types";
import { createKanbanMentionSuggestion } from "@/lib/editor/kanbanMentionSuggestion";
import type { Extensions } from "@tiptap/react";

// Create a lowlight instance with all languages
const lowlight = createLowlight(all);

interface TiptapExtensionsConfig {
  placeholder: string;
  kanbanBoards: KanbanBoard[];
}

export function createTiptapExtensions({
  placeholder,
  kanbanBoards,
}: TiptapExtensionsConfig): Extensions {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      // Disable default codeBlock, we'll use CodeBlockLowlight instead
      codeBlock: false,
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
      },
    }).configure({
      lowlight,
      defaultLanguage: null,
      languageClassPrefix: "language-",
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
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: "border-collapse table-auto w-full",
      },
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: {
        class: "border border-border bg-muted font-bold p-2",
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: "border border-border p-2",
      },
    }),
    Highlight.configure({
      HTMLAttributes: {
        class: "bg-yellow-200 dark:bg-yellow-800",
      },
    }),
    Underline,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline cursor-pointer",
      },
    }),
    Mention.configure({
      HTMLAttributes: {
        class: "mention text-primary font-medium",
      },
      suggestion: createKanbanMentionSuggestion(kanbanBoards),
      renderHTML({ node }) {
        return ['span', { class: 'mention' }, `@${node.attrs.id}`];
      },
      renderText({ node }) {
        return `@${node.attrs.id}`;
      },
    }),
    Markdown.configure({
      html: true,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ];
}
