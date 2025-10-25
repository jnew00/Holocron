/**
 * Custom hook for kanban board synchronization
 * Triggers board sync when switching to a kanban tab
 */

import { useEffect, useRef } from "react";

interface UseKanbanSyncProps {
  activeTab: string;
  onSync: () => void;
}

export function useKanbanSync({ activeTab, onSync }: UseKanbanSyncProps) {
  const previousTabRef = useRef<string>("notes");

  useEffect(() => {
    // Trigger sync when switching TO a kanban board tab
    if (activeTab.startsWith("kanban-") && previousTabRef.current !== activeTab) {
      onSync();
    }
    previousTabRef.current = activeTab;
  }, [activeTab, onSync]);
}
