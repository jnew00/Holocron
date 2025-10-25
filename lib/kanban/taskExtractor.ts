/**
 * Extract kanban tasks from note markdown content
 * Supports annotations like @kanban, #kanban, @kanban:column
 */

import { KanbanCard, KanbanColumn } from "./types";

export interface ExtractedTask {
  content: string;
  completed: boolean;
  column: string;
  boardId?: string; // Target board ID
  noteId: string;
  noteTitle: string;
  lineNumber: number;
}

/**
 * Extract tasks from markdown content that have kanban annotations
 * Supports:
 * - [ ] Task @kanban (goes to default board)
 * - [ ] Task #kanban (goes to default board)
 * - [ ] Task @board-id (goes to specific board, e.g., @jira)
 * - [ ] Task @board-id:column (goes to specific board and column, e.g., @jira:doing)
 * - [ ] Task @kanban:column (goes to default board, specific column)
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
  // Matches @kanban, #kanban, @board-id, @board-id:column, etc.
  // Allow hyphens in both board ID and column name
  const kanbanPattern = /@([\w-]+)(?::([\w-]+))?|#kanban(?::([\w-]+))?/i;

  lines.forEach((line, index) => {
    const taskMatch = line.match(taskPattern);
    if (!taskMatch) return;

    const [, indent, check, content] = taskMatch;
    const completed = check.toLowerCase() === "x";

    // Check if this task has a kanban annotation
    const kanbanMatch = content.match(kanbanPattern);
    if (!kanbanMatch) return;

    const boardOrKanban = kanbanMatch[1]; // e.g., "kanban", "jira", "default"
    const column1 = kanbanMatch[2]; // column from @board:column
    const column2 = kanbanMatch[3]; // column from #kanban:column

    // Determine board ID and column
    let boardId: string | undefined;
    let columnName: string;

    if (boardOrKanban?.toLowerCase() === "kanban") {
      // @kanban or @kanban:column → use default board
      boardId = undefined; // Will use default board
      columnName = column1 || column2 || "To Do";
    } else if (boardOrKanban) {
      // @board-id or @board-id:column → specific board
      boardId = boardOrKanban;
      columnName = column1 || "To Do";
    } else {
      // #kanban or #kanban:column → use default board
      boardId = undefined;
      columnName = column2 || "To Do";
    }

    // First, strip HTML tags (mentions are wrapped in HTML)
    let cleanContent = content.replace(/<[^>]*>/g, '').trim();

    // Then remove the annotation pattern (now without HTML interference)
    cleanContent = cleanContent.replace(kanbanPattern, '').trim();

    tasks.push({
      content: cleanContent,
      completed,
      column: capitalizeColumn(columnName),
      boardId,
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
 * @param targetBoardId - The board ID to sync tasks for (undefined = default/first board)
 */
export function syncTasksToBoard(
  markdown: string,
  noteId: string,
  noteTitle: string,
  currentColumns: KanbanColumn[],
  targetBoardId?: string
): KanbanColumn[] {
  const allExtractedTasks = extractKanbanTasks(markdown, noteId, noteTitle);

  // Filter tasks for this specific board
  const extractedTasks = allExtractedTasks.filter(task => {
    // If task has no board ID, it goes to the default board
    if (!task.boardId) {
      return !targetBoardId || targetBoardId === "default";
    }
    // Otherwise, match the board ID
    return task.boardId === targetBoardId;
  });

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

    // Determine target column based on completion status and annotation
    let targetColumnName: string;
    if (extracted?.completed) {
      // Completed tasks go to Done column
      targetColumnName = "Done";
    } else {
      // Use the specified column or default to "To Do"
      targetColumnName = extracted?.column || "To Do";
    }

    // Find column by title (case-insensitive)
    let targetColumn = updatedColumns.find(
      (col) => col.title.toLowerCase() === targetColumnName.toLowerCase()
    );

    // If target column not found, try to find a TODO-like column
    if (!targetColumn && !extracted?.completed) {
      // Try to find column by ID "todo"
      targetColumn = updatedColumns.find((col) => col.id.toLowerCase() === "todo");

      // If not found, try to find any column with "todo" or "to do" in the title
      if (!targetColumn) {
        targetColumn = updatedColumns.find(
          (col) => col.title.toLowerCase().includes("todo") ||
                  col.title.toLowerCase().includes("to do") ||
                  col.title.toLowerCase().includes("to-do")
        );
      }

      // If still not found, find the first column that's not "Done"
      if (!targetColumn) {
        targetColumn = updatedColumns.find(
          (col) => col.title.toLowerCase() !== "done" &&
                  !col.title.toLowerCase().includes("done")
        );
      }
    }

    // Final fallback: use first column
    if (!targetColumn) {
      targetColumn = updatedColumns[0];
    }

    if (targetColumn) {
      targetColumn.cards.push(card);
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

Default Board:
- [ ] Task description @kanban (adds to default board)
- [ ] Task description @kanban:doing (adds to specific column)

Specific Board:
- [ ] Task description @board-id (e.g., @jira, @default)
- [ ] Task description @board-id:doing (specific board + column)

Completion:
- [x] Completed task @kanban (automatically goes to Done)

Column names: todo, doing, review, done (case-insensitive)
`.trim();
}
