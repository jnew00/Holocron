/**
 * Custom hook for managing kanban boards
 * Handles loading and syncing kanban boards
 */

import { useState, useEffect } from "react";
import { KanbanRepository, RepositoryError } from "@/lib/repositories";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";

export function useKanbanBoards(repoPath: string | null, refreshTrigger: number) {
  const [kanbanBoards, setKanbanBoards] = useState<KanbanBoardType[]>([]);

  // Load all kanban boards
  useEffect(() => {
    const loadBoards = async () => {
      if (!repoPath) return;

      console.log("Loading kanban boards...");

      try {
        const kanbanRepo = new KanbanRepository(repoPath);
        const boards = await kanbanRepo.listBoards();
        console.log("Total boards loaded:", boards.length);
        setKanbanBoards(boards);
      } catch (error) {
        if (error instanceof RepositoryError) {
          console.error("Failed to load kanban boards:", error.message);
        } else {
          console.error("Failed to load kanban boards:", error);
        }
      }
    };

    loadBoards();
  }, [repoPath, refreshTrigger]);

  return { kanbanBoards };
}
