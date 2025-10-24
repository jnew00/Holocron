/**
 * Extract kanban tasks from note markdown content
 * Supports annotations like @kanban, #kanban, @kanban:column
 */

import { KanbanCard, KanbanColumn } from "./types";

export interface ExtractedTask {
  content: string;
  completed: boolean;
  column: string;
  noteId: string;
  noteTitle: string;
  lineNumber: number;
}

/**
 * Extract tasks from markdown content that have kanban annotations
 * Supports:
 * - [ ] Task @kanban (goes to "Backlog" by default)
 * - [ ] Task #kanban (goes to "Backlog" by default)
 * - [ ] Task @kanban:doing (goes to specified column)
 * - [x] Completed task @kanban (marked as complete)
 */
export function extractKanbanTasks(
  markdown: string,
  noteId: string,
  noteTitle: string
): ExtractedTask[] {
  const tasks: ExtractedTask[] = [];
  const lines = markdown.split("\n");

  // Regex patterns
  const taskPattern = /^(\s*)-\s+\[([ x])\]\s+(.+)$/i;
  const kanbanPattern = /@kanban(?::(\w+))?|#kanban(?::(\w+))?/i;

  lines.forEach((line, index) => {
    const taskMatch = line.match(taskPattern);
    if (!taskMatch) return;

    const [, indent, check, content] = taskMatch;
    const completed = check.toLowerCase() === "x";

    // Check if this task has a kanban annotation
    const kanbanMatch = content.match(kanbanPattern);
    if (!kanbanMatch) return;

    // Extract column from annotation (e.g., @kanban:doing)
    const column = kanbanMatch[1] || kanbanMatch[2] || "Backlog";

    // Remove the annotation from the content
    const cleanContent = content
      .replace(kanbanPattern, "")
      .trim();

    tasks.push({
      content: cleanContent,
      completed,
      column: capitalizeColumn(column),
      noteId,
      noteTitle,
      lineNumber: index + 1,
    });
  });

  return tasks;
}

/**
 * Capitalize column name (e.g., "doing" -> "Doing")
 */
function capitalizeColumn(column: string): string {
  return column.charAt(0).toUpperCase() + column.slice(1).toLowerCase();
}

/**
 * Convert extracted tasks to Kanban Card objects
 */
export function convertToKanbanCards(
  extractedTasks: ExtractedTask[],
  existingCards: KanbanCard[] = []
): KanbanCard[] {
  const kanbanCards: KanbanCard[] = [];

  extractedTasks.forEach((extracted) => {
    // Check if card already exists (by title and tags)
    const existing = existingCards.find(
      (c) =>
        c.tags?.includes(`note:${extracted.noteId}`) &&
        c.title === extracted.content
    );

    if (existing) {
      // Update existing card
      kanbanCards.push({
        ...existing,
        title: extracted.content,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new card
      kanbanCards.push({
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: extracted.content,
        description: `From: ${extracted.noteTitle} (Line ${extracted.lineNumber})`,
        tags: ["from-note", `note:${extracted.noteId}`],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

  return kanbanCards;
}

/**
 * Sync tasks from note to kanban board
 * Returns updated board columns
 */
export function syncTasksToBoard(
  markdown: string,
  noteId: string,
  noteTitle: string,
  currentColumns: KanbanColumn[]
): KanbanColumn[] {
  const extractedTasks = extractKanbanTasks(markdown, noteId, noteTitle);

  // Get all existing cards from all columns
  const allExistingCards: KanbanCard[] = [];
  currentColumns.forEach((col) => {
    allExistingCards.push(...col.cards);
  });

  // Convert extracted tasks to kanban cards
  const newCards = convertToKanbanCards(extractedTasks, allExistingCards);

  // Create new columns array
  const updatedColumns: KanbanColumn[] = currentColumns.map((col) => ({
    ...col,
    cards: [...col.cards],
  }));

  // Remove all cards linked to this note from all columns
  updatedColumns.forEach((column) => {
    column.cards = column.cards.filter(
      (card) => !card.tags?.includes(`note:${noteId}`)
    );
  });

  // Add new/updated cards to their respective columns
  newCards.forEach((card) => {
    const extracted = extractedTasks.find((et) => et.content === card.title);
    const targetColumnName = extracted?.column || "Backlog";

    // Find column by title (case-insensitive)
    const column = updatedColumns.find(
      (col) => col.title.toLowerCase() === targetColumnName.toLowerCase()
    ) || updatedColumns.find((col) => col.title === "To Do"); // Fallback to first column

    if (column) {
      column.cards.push(card);
    }
  });

  return updatedColumns;
}

/**
 * Get kanban annotation syntax help text
 */
export function getKanbanSyntaxHelp(): string {
  return `
Kanban Task Annotations:
- [ ] Task description @kanban (adds to Backlog)
- [ ] Task description #kanban (adds to Backlog)
- [ ] Task description @kanban:doing (adds to Doing column)
- [ ] Task description @kanban:done (adds to Done column)
- [x] Completed task @kanban (marked as complete)

Supported columns: backlog, doing, done (case-insensitive)
`.trim();
}
