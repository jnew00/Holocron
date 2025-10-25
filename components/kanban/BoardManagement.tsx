"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { KanbanBoard as KanbanBoardType, createDefaultBoard } from "@/lib/kanban/types";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Plus, Trash2, Edit2, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanRepository, RepositoryError } from "@/lib/repositories";

interface BoardManagementProps {
  boards: KanbanBoardType[];
  onBoardsChange: () => void;
}

export function BoardManagement({ boards, onBoardsChange }: BoardManagementProps) {
  const { repoPath } = useRepo();
  const [isOpen, setIsOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardIcon, setNewBoardIcon] = useState("");
  const [editingBoard, setEditingBoard] = useState<KanbanBoardType | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const handleCreateBoard = async () => {
    if (!repoPath || !newBoardName.trim()) {
      console.log("Cannot create board - missing repoPath or board name");
      return;
    }

    console.log("Creating board:", { name: newBoardName, icon: newBoardIcon });

    const boardId = newBoardName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newBoard = createDefaultBoard();
    newBoard.id = boardId;
    newBoard.name = newBoardName;
    newBoard.icon = newBoardIcon || undefined;

    console.log("Board data:", newBoard);

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      await kanbanRepo.saveBoard(newBoard);

      console.log("Board created successfully");
      setNewBoardName("");
      setNewBoardIcon("");
      setIsOpen(false); // Close the dialog
      onBoardsChange(); // Trigger parent refresh
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to create board:", error.message);
        alert(`Failed to create board: ${error.message}`);
      } else {
        console.error("Failed to create board:", error);
        alert(`Error creating board: ${error}`);
      }
    }
  };

  const handleUpdateBoard = async () => {
    if (!repoPath || !editingBoard || !editName.trim()) return;

    const updatedBoard = {
      ...editingBoard,
      name: editName,
      icon: editIcon || undefined,
      updatedAt: new Date().toISOString(),
    };

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      await kanbanRepo.saveBoard(updatedBoard);

      setEditingBoard(null);
      onBoardsChange();
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to update board:", error.message);
      } else {
        console.error("Failed to update board:", error);
      }
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!repoPath || boards.length <= 1) return;

    if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      return;
    }

    try {
      const kanbanRepo = new KanbanRepository(repoPath);
      await kanbanRepo.deleteBoard(boardId);

      onBoardsChange();
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to delete board:", error.message);
      } else {
        console.error("Failed to delete board:", error);
      }
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5000000) { // 5MB limit
      alert("Image file too large. Please choose an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image to 32x32
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to 32x32 for icon
        const iconSize = 32;
        canvas.width = iconSize;
        canvas.height = iconSize;

        // Draw resized image
        ctx.drawImage(img, 0, 0, iconSize, iconSize);

        // Convert to base64
        const resizedBase64 = canvas.toDataURL('image/png', 0.9);

        if (isEditing) {
          setEditIcon(resizedBase64);
        } else {
          setNewBoardIcon(resizedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleEditBoard = (board: KanbanBoardType) => {
    setEditingBoard(board);
    setEditName(board.name);
    setEditIcon(board.icon || "");
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

          <TabsContent value="create" className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="board-name">Board Name</Label>
                <Input
                  id="board-name"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="My Project Board"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newBoardName.trim()) {
                      handleCreateBoard();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="board-icon">Board Icon</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="board-icon-emoji"
                    value={newBoardIcon.startsWith('data:') ? '' : newBoardIcon}
                    onChange={(e) => setNewBoardIcon(e.target.value)}
                    placeholder="Enter emoji (e.g., 📋, 🎯, 🚀)"
                    className="flex-1"
                    maxLength={2}
                  />
                  <span className="text-muted-foreground">or</span>
                  <div className="relative">
                    <Input
                      id="board-icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload(e, false)}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('board-icon-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
                {newBoardIcon && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-xs text-muted-foreground">Preview:</span>
                    {newBoardIcon.startsWith('data:') ? (
                      <img src={newBoardIcon} alt="Icon" className="h-6 w-6 rounded" />
                    ) : (
                      <span className="text-lg">{newBoardIcon}</span>
                    )}
                  </div>
                )}
              </div>

              <Button onClick={handleCreateBoard} disabled={!newBoardName.trim()} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Board
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4 flex-1 overflow-y-auto">
            {editingBoard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Edit Board</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingBoard(null)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-board-name">Board Name</Label>
                    <Input
                      id="edit-board-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="My Project Board"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-board-icon">Board Icon</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="edit-board-icon-emoji"
                        value={editIcon.startsWith('data:') ? '' : editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        placeholder="Enter emoji (e.g., 📋, 🎯, 🚀)"
                        className="flex-1"
                        maxLength={2}
                      />
                      <span className="text-muted-foreground">or</span>
                      <div className="relative">
                        <Input
                          id="edit-board-icon-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleIconUpload(e, true)}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('edit-board-icon-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                    {editIcon && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-xs text-muted-foreground">Preview:</span>
                        {editIcon.startsWith('data:') ? (
                          <img src={editIcon} alt="Icon" className="h-6 w-6 rounded" />
                        ) : (
                          <span className="text-lg">{editIcon}</span>
                        )}
                      </div>
                    )}
                  </div>

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
                    <div
                      key={board.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {board.icon ? (
                          board.icon.startsWith('data:') ? (
                            <img src={board.icon} alt={board.name} className="h-6 w-6 rounded" />
                          ) : (
                            <span className="text-lg">{board.icon}</span>
                          )
                        ) : (
                          <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <span className="text-sm font-medium">{board.name}</span>
                          <p className="text-xs text-muted-foreground">ID: {board.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBoard(board)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        {boards.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBoard(board.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
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
