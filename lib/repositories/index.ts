/**
 * Repository pattern exports
 * Centralized data access layer for all API operations
 */

export { BaseRepository, RepositoryError } from "./base";
export { NoteRepository } from "./NoteRepository";
export { ConfigRepository } from "./ConfigRepository";
export { GitRepository } from "./GitRepository";
export { KanbanRepository } from "./KanbanRepository";

export type { NoteListItem, WriteNoteParams } from "./NoteRepository";
export type {
  GitStatusResult,
  GitBranch,
  CommitOptions,
  PullOptions,
  PushOptions,
} from "./GitRepository";
export type { KanbanBoardFile } from "./KanbanRepository";
