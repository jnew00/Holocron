/**
 * Board Management component - refactored for simplicity
 * Uses custom hooks for business logic and sub-components for UI
 */

"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";
import { useBoardOperations } from "@/hooks/useBoardOperations";
import { useIconUpload } from "@/hooks/useIconUpload";
import { BoardFormFields } from "./BoardFormFields";
import { BoardListItem } from "./BoardListItem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BoardManagementProps {
  boards: KanbanBoardType[];
  onBoardsChange: () => void;
}

export function BoardManagement({ boards, onBoardsChange }: BoardManagementProps) {
  const { repoPath } = useRepo();
  const [isOpen, setIsOpen] = useState(false);

  // Board operations hook
  const {
    newBoardName,
    setNewBoardName,
    newBoardIcon,
    setNewBoardIcon,
    editingBoard,
    editName,
    setEditName,
    editIcon,
    setEditIcon,
    handleCreateBoard,
    handleUpdateBoard,
    handleDeleteBoard,
    handleEditBoard,
    handleCancelEdit,
  } = useBoardOperations({ repoPath, onBoardsChange });

  // Icon upload hooks
  const { handleIconUpload: handleNewIconUpload } = useIconUpload({
    onIconChange: setNewBoardIcon,
  });

  const { handleIconUpload: handleEditIconUpload } = useIconUpload({
    onIconChange: setEditIcon,
  });

  // Handle create board with dialog close
  const handleCreate = async () => {
    const success = await handleCreateBoard();
    if (success) {
      setIsOpen(false);
    }
  };

  // Handle Enter key in name field
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newBoardName.trim()) {
      handleCreate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Manage Boards
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Kanban Boards</DialogTitle>
          <DialogDescription>
            Create, edit, and delete your Kanban boards
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="manage">Manage Existing</TabsTrigger>
          </TabsList>

          {/* Create Board Tab */}
          <TabsContent value="create" className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <BoardFormFields
                nameValue={newBoardName}
                onNameChange={setNewBoardName}
                iconValue={newBoardIcon}
                onIconChange={setNewBoardIcon}
                onIconUpload={handleNewIconUpload}
                inputIdPrefix="board"
              />

              <Button onClick={handleCreate} disabled={!newBoardName.trim()} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Board
              </Button>
            </div>
          </TabsContent>

          {/* Manage Boards Tab */}
          <TabsContent value="manage" className="space-y-4 flex-1 overflow-y-auto">
            {editingBoard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Edit Board</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-4">
                  <BoardFormFields
                    nameValue={editName}
                    onNameChange={setEditName}
                    iconValue={editIcon}
                    onIconChange={setEditIcon}
                    onIconUpload={handleEditIconUpload}
                    inputIdPrefix="edit-board"
                  />

                  <Button onClick={handleUpdateBoard} disabled={!editName.trim()} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Existing Boards ({boards.length})</Label>
                <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                  {boards.map((board) => (
                    <BoardListItem
                      key={board.id}
                      board={board}
                      onEdit={handleEditBoard}
                      onDelete={(boardId) => handleDeleteBoard(boardId, boards.length)}
                      canDelete={boards.length > 1}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Boards are stored in kanban/*.json files. At least one board must exist.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
