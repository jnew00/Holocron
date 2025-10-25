"use client";

import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { KanbanMentionItem } from "@/lib/editor/kanbanSuggestions";

interface UseKanbanMentionListParams {
  items: KanbanMentionItem[];
  command: (item: KanbanMentionItem) => void;
  ref: React.ForwardedRef<any>;
}

interface UseKanbanMentionListReturn {
  selectedIndex: number;
  selectItem: (index: number) => void;
}

export function useKanbanMentionList({
  items,
  command,
  ref,
}: UseKanbanMentionListParams): UseKanbanMentionListReturn {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const selectItem = useCallback(
    (index: number): void => {
      const item = items[index];
      if (item) {
        command(item);
      }
    },
    [items, command]
  );

  const upHandler = useCallback((): void => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  }, [selectedIndex, items.length]);

  const downHandler = useCallback((): void => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  }, [selectedIndex, items.length]);

  const enterHandler = useCallback((): void => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }): boolean => {
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

  return {
    selectedIndex,
    selectItem,
  };
}
