/**
 * React hook for accessing repositories
 * Provides easy access to all data access layers
 */

import { useMemo } from "react";
import {
  NoteRepository,
  ConfigRepository,
  GitRepository,
  KanbanRepository,
} from "@/lib/repositories";

/**
 * Hook to create repository instances
 * Memoized to avoid recreating on every render
 */
export function useRepositories(repoPath: string | null) {
  const repositories = useMemo(() => {
    if (!repoPath) {
      return {
        notes: null,
        config: null,
        git: null,
        kanban: null,
      };
    }

    return {
      notes: new NoteRepository(repoPath),
      config: new ConfigRepository(repoPath),
      git: new GitRepository(repoPath),
      kanban: new KanbanRepository(repoPath),
    };
  }, [repoPath]);

  return repositories;
}
