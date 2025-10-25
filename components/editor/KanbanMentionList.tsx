"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { KanbanBoard } from "@/lib/kanban/types";

export interface KanbanMentionItem {
  id: string;
  label: string;
  description: string;
  type: "board" | "board-column";
}

interface KanbanMentionListProps {
  items: KanbanMentionItem[];
  command: (item: KanbanMentionItem) => void;
}

export const KanbanMentionList = forwardRef<any, KanbanMentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    if (props.items.length === 0) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-2 text-sm text-muted-foreground">
          No boards found
        </div>
      );
    }

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
        {props.items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => selectItem(index)}
            className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2 transition-colors ${
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

KanbanMentionList.displayName = "KanbanMentionList";

/**
 * Generate suggestion items from available boards
 */
export function generateKanbanSuggestions(
  boards: KanbanBoard[],
  query: string
): KanbanMentionItem[] {
  const items: KanbanMentionItem[] = [];

  // Add generic @kanban option
  if ("kanban".includes(query.toLowerCase())) {
    items.push({
      id: "kanban",
      label: "@kanban",
      description: "Add to default board",
      type: "board",
    });
  }

  // Add each board and its columns
  boards.forEach((board) => {
    const boardId = board.id.toLowerCase();

    // Add board option
    if (boardId.includes(query.toLowerCase())) {
      items.push({
        id: board.id,
        label: `@${board.id}`,
        description: `Add to ${board.name}`,
        type: "board",
      });
    }

    // Add board:column options
    board.columns.forEach((column) => {
      const columnId = column.title.toLowerCase().replace(/\s+/g, "-");
      const fullId = `${board.id}:${columnId}`;

      if (
        fullId.includes(query.toLowerCase()) ||
        column.title.toLowerCase().includes(query.toLowerCase())
      ) {
        items.push({
          id: fullId,
          label: `@${fullId}`,
          description: `${board.name} → ${column.title}`,
          type: "board-column",
        });
      }
    });
  });

  return items;
}
