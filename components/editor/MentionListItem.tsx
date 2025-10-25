"use client";

import React, { memo } from "react";
import { KanbanMentionItem } from "@/lib/editor/kanbanSuggestions";

interface MentionListItemProps {
  item: KanbanMentionItem;
  isSelected: boolean;
  onClick: () => void;
}

export const MentionListItem = memo<MentionListItemProps>(
  ({ item, isSelected, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2 transition-colors ${
          isSelected
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
    );
  }
);

MentionListItem.displayName = "MentionListItem";
