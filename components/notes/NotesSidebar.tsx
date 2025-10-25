"use client";

import { useState, useEffect, useRef } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Search, Archive, Trash2, ArchiveRestore, PanelLeftClose, Clock, FolderTree } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteMetadata {
  name: string;
  path: string;
  title: string;
  modified: string;
  size: number;
  type?: string;
}

interface NotesSidebarProps {
  currentNoteId: string | null;
  onSelectNote: (notePath: string) => void;
  onNewNote: () => void;
  onArchiveNote: (notePath: string) => void;
  onDeleteNote: (notePath: string) => void;
  onCollapse?: () => void;
  refreshTrigger?: number;
}

export function NotesSidebar({
  currentNoteId,
  onSelectNote,
  onNewNote,
  onArchiveNote,
  onDeleteNote,
  onCollapse,
  refreshTrigger,
}: NotesSidebarProps) {
  const { repoPath } = useRepo();
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"time" | "type">("time");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const loadNotes = async () => {
    if (!repoPath) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/notes/list?repoPath=${encodeURIComponent(repoPath)}`
      );

      if (response.ok) {
        const data = await response.json();

        // Transform API response to match our NoteMetadata format
        const loadedNotes: NoteMetadata[] = data.notes
          .filter((note: any) => {
            const isArchived = note.path.startsWith("archive/");
            return showArchived ? isArchived : !isArchived;
          })
          .map((note: any) => {
            // Extract title from filename
            const fileName = note.name.replace(".md", "");
            const title = fileName
              .split("-")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            return {
              name: note.name,
              path: note.path,
              title,
              modified: note.modified,
              size: note.size,
              type: note.type || "note",
            };
          });

        console.log("Loaded notes with types:", loadedNotes.map(n => ({ title: n.title, type: n.type })));
        setNotes(loadedNotes);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [repoPath, showArchived, refreshTrigger]);

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 240 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group notes by type category
  const groupNotesByType = (notes: NoteMetadata[]) => {
    const groups: Record<string, NoteMetadata[]> = {
      "TODO Lists": [],
      "Meetings": [],
      "Scratchpads": [],
      "Today I Learned": [],
      "Projects": [],
      "Weekly Reviews": [],
      "Books": [],
      "Notes": [],
    };

    notes.forEach((note) => {
      const type = note.type || "note";
      switch (type) {
        case "todo":
          groups["TODO Lists"].push(note);
          break;
        case "meeting":
          groups["Meetings"].push(note);
          break;
        case "scratchpad":
          groups["Scratchpads"].push(note);
          break;
        case "til":
          groups["Today I Learned"].push(note);
          break;
        case "project":
          groups["Projects"].push(note);
          break;
        case "weekly":
          groups["Weekly Reviews"].push(note);
          break;
        case "book":
          groups["Books"].push(note);
          break;
        default:
          groups["Notes"].push(note);
      }
    });

    return groups;
  };

  // Group notes by time category
  const groupNotesByTime = (notes: NoteMetadata[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const groups: Record<string, NoteMetadata[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    notes.forEach((note) => {
      const noteDate = new Date(note.modified);
      if (noteDate >= today) {
        groups.Today.push(note);
      } else if (noteDate >= yesterday) {
        groups.Yesterday.push(note);
      } else if (noteDate >= thisWeekStart) {
        groups["This Week"].push(note);
      } else if (noteDate >= thisMonthStart) {
        groups["This Month"].push(note);
      } else {
        groups.Older.push(note);
      }
    });

    return groups;
  };

  const groupedNotes =
    sortBy === "time"
      ? groupNotesByTime(filteredNotes)
      : groupNotesByType(filteredNotes);

  // Debug logging
  if (sortBy === "type") {
    console.log("Grouping by type. Filtered notes:", filteredNotes.map(n => ({ title: n.title, type: n.type })));
    console.log("Grouped result:", Object.entries(groupedNotes).map(([cat, notes]) => ({ category: cat, count: notes.length })));
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmNote) {
      onDeleteNote(deleteConfirmNote);
      setDeleteConfirmNote(null);
      loadNotes();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className="border-r bg-muted/30 flex flex-col h-full relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center gap-2">
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCollapse}
                title="Hide sidebar"
                className="h-8 w-8 p-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
            <h2 className="font-semibold text-base flex-1">Notes</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Sort by"
                >
                  {sortBy === "time" ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <FolderTree className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("time")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Sort by Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("type")}>
                  <FolderTree className="h-4 w-4 mr-2" />
                  Sort by Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={onNewNote} className="h-8">
              <FileText className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Loading notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {searchQuery
                ? "No notes found"
                : showArchived
                ? "No archived notes"
                : "No notes yet. Create one!"}
            </div>
          ) : (
            <div className="p-1">
              {Object.entries(groupedNotes).map(([category, categoryNotes], categoryIndex) => {
                if (categoryNotes.length === 0) return null;

                return (
                  <div key={`${sortBy}-${category}-${categoryIndex}`} className="mb-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      {category}
                    </h3>
                    {categoryNotes.map((note, index) => {
                      const isArchived = note.path.startsWith("archive/");
                      return (
                      <div key={`${sortBy}-${category}-${categoryIndex}-${index}-${note.path}`}>
                        <div
                          className={`p-2 mx-1 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                            currentNoteId === note.path ? "bg-muted" : ""
                          }`}
                          onClick={() => onSelectNote(note.path)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate mb-0.5">
                                {note.title || "Untitled"}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(note.modified)}
                              </p>
                            </div>
                            <div className="flex gap-0.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchiveNote(note.path);
                                  loadNotes();
                                }}
                                title={isArchived ? "Unarchive" : "Archive"}
                              >
                                {isArchived ? (
                                  <ArchiveRestore className="h-3 w-3" />
                                ) : (
                                  <Archive className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmNote(note.path);
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {isArchived && (
                            <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                              Archived
                            </span>
                          )}
                        </div>
                        {index < categoryNotes.length - 1 && (
                          <Separator className="my-1" />
                        )}
                      </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer with Archive Toggle */}
        <div className="p-3 border-t bg-background z-10">
          <Button
            variant={showArchived ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="w-full justify-center h-9"
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Hide Archived
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Show Archived
              </>
            )}
          </Button>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />
      </div>

      <AlertDialog
        open={deleteConfirmNote !== null}
        onOpenChange={(open) => !open && setDeleteConfirmNote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the note. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
