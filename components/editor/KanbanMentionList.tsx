"use client";

import React, { forwardRef } from "react";
import { KanbanMentionItem } from "@/lib/editor/kanbanSuggestions";
import { useKanbanMentionList } from "@/hooks/useKanbanMentionList";
import { MentionListItem } from "./MentionListItem";

interface KanbanMentionListProps {
  items: KanbanMentionItem[];
  command: (item: KanbanMentionItem) => void;
}

export const KanbanMentionList = forwardRef<any, KanbanMentionListProps>(
  (props, ref) => {
    const { selectedIndex, selectItem } = useKanbanMentionList({
      items: props.items,
      command: props.command,
      ref,
    });

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
          <MentionListItem
            key={item.id}
            item={item}
            isSelected={index === selectedIndex}
            onClick={() => selectItem(index)}
          />
        ))}
      </div>
    );
  }
);

KanbanMentionList.displayName = "KanbanMentionList";
