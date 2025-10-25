"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
import { FileText, Archive, ArchiveRestore, PanelLeftClose } from "lucide-react";
import { useNotesSidebar } from "@/hooks/useNotesSidebar";
import { NoteSearchBar } from "./NoteSearchBar";
import { NoteSortDropdown } from "./NoteSortDropdown";
import { NoteGroupSection } from "./NoteGroupSection";

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
  const {
    notes,
    groupedNotes,
    searchQuery,
    showArchived,
    loading,
    deleteConfirmNote,
    sortBy,
    sidebarWidth,
    sidebarRef,
    setSearchQuery,
    setShowArchived,
    setDeleteConfirmNote,
    setSortBy,
    setIsResizing,
    handleDeleteConfirm,
    handleArchiveNote,
    formatDate,
  } = useNotesSidebar({ refreshTrigger });

  return (
    <>
      <div
        ref={sidebarRef}
        className="border-r bg-muted/30 flex flex-col h-full relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
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
            <NoteSortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            <Button size="sm" onClick={onNewNote} className="h-8">
              <FileText className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          <NoteSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {searchQuery
                ? "No notes found"
                : showArchived
                ? "No archived notes"
                : "No notes yet. Create one!"}
            </div>
          ) : (
            <div className="p-1">
              {Object.entries(groupedNotes).map(([category, categoryNotes], categoryIndex) => (
                <NoteGroupSection
                  key={`${sortBy}-${category}-${categoryIndex}`}
                  category={category}
                  notes={categoryNotes}
                  sortBy={sortBy}
                  categoryIndex={categoryIndex}
                  currentNoteId={currentNoteId}
                  formatDate={formatDate}
                  onSelectNote={onSelectNote}
                  onArchiveNote={(path) => handleArchiveNote(path, onArchiveNote)}
                  onDeleteNote={setDeleteConfirmNote}
                />
              ))}
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

      {/* Delete Confirmation Dialog */}
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
              onClick={() => handleDeleteConfirm(onDeleteNote)}
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
