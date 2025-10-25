"use client";

import { useState, useEffect } from "react";
import { useRepo } from "@/contexts/RepoContext";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  KanbanBoard as KanbanBoardType,
  KanbanCard as KanbanCardType,
  createCard,
  createDefaultBoard,
  isWipLimitReached,
} from "@/lib/kanban/types";
import { syncTasksToBoard } from "@/lib/kanban/taskExtractor";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Settings, Trash2, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface KanbanBoardProps {
  boardId: string;
  onBoardUpdate?: () => void;
  syncTrigger?: number;
}

export function KanbanBoard({ boardId, onBoardUpdate, syncTrigger }: KanbanBoardProps) {
  const { repoPath } = useRepo();
  const [board, setBoard] = useState<KanbanBoardType>(createDefaultBoard());
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardColumn, setNewCardColumn] = useState("todo");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingColumns, setEditingColumns] = useState(board.columns);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Track if board has been loaded from disk

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setBoard((prev) => {
      // Find columns using the current state, not stale board reference
      const activeColumn = prev.columns.find((col) =>
        col.cards.some((card) => card.id === activeId)
      );
      const overColumn = prev.columns.find(
        (col) => col.id === overId || col.cards.some((card) => card.id === overId)
      );

      if (!activeColumn || !overColumn) return prev;
      if (activeColumn.id === overColumn.id) return prev;

      // Note: WIP limit is shown as a visual warning only, not enforced

      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
      }));

      const activeColIndex = newColumns.findIndex((col) => col.id === activeColumn.id);
      const overColIndex = newColumns.findIndex((col) => col.id === overColumn.id);

      // Safety check
      if (activeColIndex === -1 || overColIndex === -1) return prev;

      const activeCardIndex = newColumns[activeColIndex].cards.findIndex(
        (card) => card.id === activeId
      );

      // Safety check
      if (activeCardIndex === -1) return prev;

      const [card] = newColumns[activeColIndex].cards.splice(activeCardIndex, 1);
      newColumns[overColIndex].cards.push(card);

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );

    if (!activeColumn) return;

    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cards.some((card) => card.id === overId)
    );

    if (!overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // Reordering within same column
      const oldIndex = activeColumn.cards.findIndex((card) => card.id === activeId);
      const newIndex = activeColumn.cards.findIndex((card) => card.id === overId);

      if (oldIndex !== newIndex) {
        setBoard((prev) => {
          const newColumns = prev.columns.map((col) => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                cards: arrayMove(col.cards, oldIndex, newIndex),
              };
            }
            return col;
          });

          return {
            ...prev,
            columns: newColumns,
            updatedAt: new Date().toISOString(),
          };
        });
      }
    }
  };

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;

    const card = createCard(newCardTitle, newCardDescription || undefined);

    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => {
        if (col.id === newCardColumn) {
          return {
            ...col,
            cards: [...col.cards, card],
          };
        }
        return col;
      });

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });

    setNewCardTitle("");
    setNewCardDescription("");
    setIsDialogOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      }));

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleUpdateCard = (cardId: string, updates: Partial<KanbanCardType>) => {
    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      }));

      return {
        ...prev,
        columns: newColumns,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleArchiveDoneColumn = async (columnId: string) => {
    if (!repoPath) return;

    const doneColumn = board.columns.find((col) => col.id === columnId);
    if (!doneColumn || doneColumn.cards.length === 0) return;

    setIsSyncing(true);
    try {
      // Create archive entry
      const archiveEntry = {
        archivedAt: new Date().toISOString(),
        cards: doneColumn.cards.map((card) => ({
          title: card.title,
          description: card.description,
          tags: card.tags,
          createdAt: card.createdAt,
          completedAt: new Date().toISOString(),
        })),
      };

      // Read existing archive file (stored in archive folder)
      const archivePath = "archive/kanban-archive.md";
      let archiveContent = "";

      try {
        const response = await fetch(
          `/api/notes/read?repoPath=${encodeURIComponent(repoPath)}&notePath=${encodeURIComponent(archivePath)}`
        );
        if (response.ok) {
          const data = await response.json();
          archiveContent = data.content;
        }
      } catch (err) {
        // Archive file doesn't exist yet, will create it
      }

      // Append new archived tasks to the file
      const newArchiveSection = `
## Archived ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

${doneColumn.cards.map((card) => {
  const noteInfo = card.description?.match(/From: (.+) \(Line \d+\)/) || [];
  const fromNote = noteInfo[1] || "Manual entry";
  return `- [x] ${card.title} ${fromNote ? `_(from ${fromNote})_` : ""}\n  - Completed: ${new Date().toLocaleString()}`;
}).join('\n')}

---
`;

      // Prepend new entries to the top (most recent first)
      const updatedArchiveContent = archiveContent
        ? `# Kanban Archive\n\n${newArchiveSection}\n${archiveContent.replace(/^#\s+Kanban Archive\n+/, '')}`
        : `# Kanban Archive\n\n${newArchiveSection}`;

      // Write archive file
      await fetch("/api/notes/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          notePath: archivePath,
          content: updatedArchiveContent,
        }),
      });

      // Remove archived cards from board
      setBoard((prev) => {
        const newColumns = prev.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: [],
            };
          }
          return col;
        });

        return {
          ...prev,
          columns: newColumns,
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Failed to archive tasks:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenSettings = () => {
    setEditingColumns(board.columns.map(col => ({ ...col })));
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    setBoard((prev) => ({
      ...prev,
      columns: editingColumns.map(col => ({
        ...col,
        cards: prev.columns.find(c => c.id === col.id)?.cards || col.cards,
      })),
      updatedAt: new Date().toISOString(),
    }));
    setIsSettingsOpen(false);
  };

  const handleUpdateColumn = (columnId: string, updates: Partial<KanbanBoardType["columns"][0]>) => {
    setEditingColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      )
    );
  };

  const handleAddColumn = () => {
    const newColumn = {
      id: `col-${Date.now()}`,
      title: "New Column",
      cards: [],
      wipLimit: undefined,
      color: "#6366f1",
    };
    setEditingColumns((prev) => [...prev, newColumn]);
  };

  const handleDeleteColumn = (columnId: string) => {
    setEditingColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  // Load the board
  const loadBoard = async () => {
    if (!repoPath || !boardId) return;

    try {
      const response = await fetch(
        `/api/notes/read?repoPath=${encodeURIComponent(repoPath)}&notePath=${encodeURIComponent(`kanban/${boardId}.json`)}`
      );

      if (response.ok) {
        const data = await response.json();
        const loadedBoard = JSON.parse(data.content);
        setBoard(loadedBoard);
        setIsLoaded(true); // Mark as loaded
      } else if (response.status === 404) {
        // Only create default board if file doesn't exist (404)
        console.log("Board not found, creating default board");
        const defaultBoard = createDefaultBoard();
        defaultBoard.id = boardId;
        setBoard(defaultBoard);
        setIsLoaded(true); // Mark as loaded
        await saveBoard(defaultBoard);
      } else {
        // For other errors (permissions, etc), don't overwrite - just log
        console.error("Failed to load board, status:", response.status);
      }
    } catch (error) {
      // For parse errors or network errors, don't overwrite the board
      console.error("Error loading board:", error);
    }
  };

  // Save current board
  const saveBoard = async (boardToSave?: KanbanBoardType) => {
    if (!repoPath) return;

    const boardData = boardToSave || board;

    try {
      await fetch("/api/notes/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          notePath: `kanban/${boardData.id}.json`,
          content: JSON.stringify(boardData, null, 2),
        }),
      });

      // Notify parent to refresh boards list
      onBoardUpdate?.();
    } catch (error) {
      console.error("Failed to save board:", error);
    }
  };

  const handleSyncFromNotes = async () => {
    if (!repoPath || !isLoaded) return; // Don't sync until board is loaded!

    setIsSyncing(true);
    try {
      // Fetch all notes
      const response = await fetch(
        `/api/notes/list?repoPath=${encodeURIComponent(repoPath)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      const notes = data.notes || [];

      // Process each note and sync tasks
      let updatedColumns = board.columns.map(col => ({ ...col, cards: [...col.cards] }));

      for (const note of notes) {
        // Skip kanban archive file
        if (note.path.includes('kanban-archive.md')) {
          continue;
        }

        try {
          const noteResponse = await fetch(
            `/api/notes/read?repoPath=${encodeURIComponent(repoPath)}&notePath=${encodeURIComponent(note.path)}`
          );

          if (noteResponse.ok) {
            const noteData = await noteResponse.json();
            const noteId = note.path;
            const noteTitle = note.name.replace('.md', '');

            // Sync tasks from this note for this specific board
            updatedColumns = syncTasksToBoard(
              noteData.content,
              noteId,
              noteTitle,
              updatedColumns,
              boardId // Pass the current board ID
            );
          }
        } catch (err) {
          console.error(`Failed to process note ${note.path}:`, err);
        }
      }

      setBoard((prev) => ({
        ...prev,
        columns: updatedColumns,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to sync from notes:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load board on mount
  useEffect(() => {
    if (repoPath && boardId) {
      loadBoard();
    }
  }, [repoPath, boardId]);

  // Sync from notes when syncTrigger changes OR when board finishes loading
  useEffect(() => {
    if (repoPath && boardId && syncTrigger && syncTrigger > 0 && isLoaded) {
      handleSyncFromNotes();
    }
  }, [syncTrigger, isLoaded]); // Now also triggers when isLoaded changes

  // NOTE: Auto-sync disabled to prevent cards from disappearing
  // Users can manually sync using the "Sync from Notes" button
  // useEffect(() => {
  //   if (repoPath && boardId) {
  //     const interval = setInterval(() => {
  //       handleSyncFromNotes();
  //     }, 30000);
  //     return () => clearInterval(interval);
  //   }
  // }, [repoPath, boardId]);

  // Auto-save board when it changes (but only after initial load)
  useEffect(() => {
    if (repoPath && board.id && isLoaded) {
      const timeoutId = setTimeout(() => {
        saveBoard();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [board, repoPath, isLoaded]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Drag cards between columns • WIP limits enforced
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFromNotes}
            disabled={isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from Notes'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Board
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Create a new card for your Kanban board
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-title">Title</Label>
                <Input
                  id="card-title"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-description">Description (optional)</Label>
                <Input
                  id="card-description"
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  placeholder="Enter description..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-column">Column</Label>
                <select
                  id="card-column"
                  value={newCardColumn}
                  onChange={(e) => setNewCardColumn(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {board.columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCard} disabled={!newCardTitle.trim()}>
                Add Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Board Configuration Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Configure Kanban Board</DialogTitle>
            <DialogDescription>
              Manage columns, set WIP limits, and customize your board
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 py-4">
            {editingColumns.map((column, index) => (
              <div key={column.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Column {index + 1}</h3>
                  {editingColumns.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteColumn(column.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`col-title-${column.id}`}>Column Title</Label>
                    <Input
                      id={`col-title-${column.id}`}
                      value={column.title}
                      onChange={(e) =>
                        handleUpdateColumn(column.id, { title: e.target.value })
                      }
                      placeholder="Column title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`col-wip-${column.id}`}>
                      WIP Limit (optional)
                    </Label>
                    <Input
                      id={`col-wip-${column.id}`}
                      type="number"
                      min="0"
                      value={column.wipLimit || ""}
                      onChange={(e) =>
                        handleUpdateColumn(column.id, {
                          wipLimit: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="No limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum cards allowed in this column
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`col-color-${column.id}`}>Column Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`col-color-${column.id}`}
                        type="color"
                        value={column.color || "#64748b"}
                        onChange={(e) =>
                          handleUpdateColumn(column.id, { color: e.target.value })
                        }
                        className="w-20 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={column.color || "#64748b"}
                        onChange={(e) =>
                          handleUpdateColumn(column.id, { color: e.target.value })
                        }
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {index < editingColumns.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            <Button
              variant="outline"
              onClick={handleAddColumn}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onDeleteCard={handleDeleteCard}
              onUpdateCard={handleUpdateCard}
              onArchiveColumn={
                column.title.toLowerCase() === "done"
                  ? () => handleArchiveDoneColumn(column.id)
                  : undefined
              }
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard card={activeCard} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
