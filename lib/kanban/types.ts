/**
 * Kanban board types and interfaces
 */

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  wipLimit?: number; // Work-in-progress limit
  color?: string;
}

export interface KanbanBoard {
  id: string;
  name: string;
  columns: KanbanColumn[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Default board configuration
 */
export const createDefaultBoard = (): KanbanBoard => ({
  id: "default",
  name: "My Board",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  columns: [
    {
      id: "todo",
      title: "To Do",
      cards: [],
      wipLimit: undefined,
      color: "#64748b",
    },
    {
      id: "in-progress",
      title: "In Progress",
      cards: [],
      wipLimit: 3,
      color: "#3b82f6",
    },
    {
      id: "review",
      title: "Review",
      cards: [],
      wipLimit: 2,
      color: "#f59e0b",
    },
    {
      id: "done",
      title: "Done",
      cards: [],
      wipLimit: undefined,
      color: "#10b981",
    },
  ],
});

/**
 * Create a new card
 */
export const createCard = (title: string, description?: string): KanbanCard => ({
  id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title,
  description,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Check if a column has reached its WIP limit
 */
export const isWipLimitReached = (column: KanbanColumn): boolean => {
  if (!column.wipLimit) return false;
  return column.cards.length >= column.wipLimit;
};

/**
 * Move a card between columns
 */
export const moveCard = (
  board: KanbanBoard,
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  toIndex: number
): KanbanBoard => {
  const newColumns = board.columns.map((col) => ({ ...col, cards: [...col.cards] }));

  const fromColumn = newColumns.find((col) => col.id === fromColumnId);
  const toColumn = newColumns.find((col) => col.id === toColumnId);

  if (!fromColumn || !toColumn) return board;

  const cardIndex = fromColumn.cards.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) return board;

  const [card] = fromColumn.cards.splice(cardIndex, 1);
  toColumn.cards.splice(toIndex, 0, card);

  return {
    ...board,
    columns: newColumns,
    updatedAt: new Date().toISOString(),
  };
};
