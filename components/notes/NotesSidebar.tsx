"use client";

import { useState, useEffect, useRef } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { NoteMetadata, listNotes, deleteNote } from "@/lib/notes/noteManager";
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
import { FileText, Search, Archive, Trash2, ArchiveRestore } from "lucide-react";

interface NotesSidebarProps {
  currentNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onNewNote: () => void;
  onArchiveNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  refreshTrigger?: number;
}

export function NotesSidebar({
  currentNoteId,
  onSelectNote,
  onNewNote,
  onArchiveNote,
  onDeleteNote,
  refreshTrigger,
}: NotesSidebarProps) {
  const { dirHandle, passphrase } = useRepo();
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
    if (!dirHandle || !passphrase) return;

    setLoading(true);
    try {
      const loadedNotes = await listNotes(dirHandle, passphrase, showArchived);
      setNotes(loadedNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [dirHandle, passphrase, showArchived, refreshTrigger]);

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
      const noteDate = new Date(note.updatedAt);
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
        className="border-r bg-muted/30 flex flex-col h-screen relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-lg">Notes</h2>
            <Button size="sm" onClick={onNewNote} className="ml-auto">
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
              className="pl-8"
            />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              <Button
                variant={sortBy === "time" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("time")}
                className="flex-1 text-xs"
              >
                By Time
              </Button>
              <Button
                variant={sortBy === "type" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("type")}
                className="flex-1 text-xs"
              >
                By Type
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="w-full justify-start text-xs"
            >
              {showArchived ? (
                <>
                  <ArchiveRestore className="h-3 w-3 mr-2" />
                  Hide Archived
                </>
              ) : (
                <>
                  <Archive className="h-3 w-3 mr-2" />
                  Show Archived
                </>
              )}
            </Button>
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
            <div className="p-2">
              {Object.entries(groupedNotes).map(([category, categoryNotes], categoryIndex) => {
                if (categoryNotes.length === 0) return null;

                return (
                  <div key={`${sortBy}-${category}-${categoryIndex}`} className="mb-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                      {category}
                    </h3>
                    {categoryNotes.map((note, index) => (
                      <div key={`${sortBy}-${category}-${categoryIndex}-${index}-${note.id}`}>
                        <div
                          className={`p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                            currentNoteId === note.id ? "bg-muted" : ""
                          }`}
                          onClick={() => onSelectNote(note.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate mb-1">
                                {note.title || "Untitled"}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(note.updatedAt)}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchiveNote(note.id);
                                  loadNotes();
                                }}
                                title={note.archived ? "Unarchive" : "Archive"}
                              >
                                {note.archived ? (
                                  <ArchiveRestore className="h-3 w-3" />
                                ) : (
                                  <Archive className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmNote(note.id);
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {note.archived && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                              Archived
                            </span>
                          )}
                        </div>
                        {index < categoryNotes.length - 1 && (
                          <Separator className="my-1" />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

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
