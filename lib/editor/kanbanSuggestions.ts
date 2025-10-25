import { KanbanBoard } from "@/lib/kanban/types";

export interface KanbanMentionItem {
  id: string;
  label: string;
  description: string;
  type: "board" | "board-column";
}

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
