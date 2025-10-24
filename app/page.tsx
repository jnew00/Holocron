"use client";

import { useState, useEffect } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { LockedScreen } from "@/components/security/LockedScreen";
import { LockButton } from "@/components/security/LockButton";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { NotesSidebar } from "@/components/notes/NotesSidebar";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { GitSync } from "@/components/git/GitSync";
import { KanbanSyntaxHelp } from "@/components/kanban/KanbanSyntaxHelp";
import { NoteTemplate } from "@/lib/templates/templates";
import {
  Note,
  generateNoteId,
  saveNote,
  loadNote,
  deleteNote as deleteNoteFile,
  archiveNote as archiveNoteFile,
  listNotes,
} from "@/lib/notes/noteManager";
import { syncTasksToBoard } from "@/lib/kanban/taskExtractor";
import { loadBoard, saveBoard } from "@/lib/kanban/kanbanManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Kanban,
  Save,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isUnlocked, dirHandle, passphrase } = useRepo();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-save every 2 seconds when content changes
  useEffect(() => {
    if (!currentNote || !dirHandle || !passphrase) return;

    const timeoutId = setTimeout(async () => {
      if (markdown !== currentNote.content) {
        await handleSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [markdown, currentNote, dirHandle, passphrase]);

  const handleNewNote = async () => {
    if (!dirHandle || !passphrase) return;

    const newNote: Note = {
      id: generateNoteId(),
      title: "Untitled Note",
      content: "# Untitled Note\n\n",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save the note immediately so it appears in the sidebar
    try {
      await saveNote(dirHandle, newNote, passphrase);
      setCurrentNote(newNote);
      setMarkdown(newNote.content);
      setRefreshTrigger((prev) => prev + 1); // Trigger sidebar refresh
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleTemplateSelect = async (template: NoteTemplate) => {
    if (!dirHandle || !passphrase) return;

    const newNote: Note = {
      id: generateNoteId(),
      title: template.name,
      content: template.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: template.type,
    };

    // Save the note immediately so it appears in the sidebar
    try {
      await saveNote(dirHandle, newNote, passphrase);
      setCurrentNote(newNote);
      setMarkdown(template.content);
      setRefreshTrigger((prev) => prev + 1); // Trigger sidebar refresh
    } catch (error) {
      console.error("Failed to create note from template:", error);
    }
  };

  const handleSelectNote = async (noteId: string) => {
    if (!dirHandle || !passphrase) return;

    try {
      const notes = await listNotes(dirHandle, passphrase, true);
      const noteMeta = notes.find((n) => n.id === noteId);
      if (!noteMeta) return;

      // Build file path
      const date = new Date(noteMeta.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const slug =
        noteMeta.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "") || "untitled";
      const filePath = `notes/${year}/${month}/${day}/${slug}.md.enc`;

      const note = await loadNote(dirHandle, filePath, passphrase);
      setCurrentNote(note);
      setMarkdown(note.content);
    } catch (error) {
      console.error("Failed to load note:", error);
    }
  };

  const handleSave = async () => {
    if (!currentNote || !dirHandle || !passphrase) return;

    setIsSaving(true);
    try {
      // Extract title from markdown (first H1)
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : "Untitled";

      const updatedNote: Note = {
        ...currentNote,
        title,
        content: markdown,
        updatedAt: new Date().toISOString(),
      };

      await saveNote(dirHandle, updatedNote, passphrase);
      setCurrentNote(updatedNote);
      setLastSaved(new Date());
      setRefreshTrigger((prev) => prev + 1); // Update sidebar with new title

      // Sync tasks to kanban board if note contains @kanban annotations
      try {
        const board = await loadBoard(dirHandle, passphrase);
        const updatedColumns = syncTasksToBoard(
          markdown,
          updatedNote.id,
          updatedNote.title,
          board.columns
        );

        // Save updated board if tasks were modified
        if (JSON.stringify(updatedColumns) !== JSON.stringify(board.columns)) {
          await saveBoard(dirHandle, { ...board, columns: updatedColumns }, passphrase);
        }
      } catch (error) {
        // Don't fail the save if kanban sync fails
        console.error("Failed to sync tasks to kanban:", error);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!dirHandle) return;

    try {
      const notes = await listNotes(dirHandle, passphrase!, true);
      const noteMeta = notes.find((n) => n.id === noteId);
      if (!noteMeta) return;

      const date = new Date(noteMeta.createdAt);
      const note: Note = {
        id: noteMeta.id,
        title: noteMeta.title,
        content: "",
        createdAt: noteMeta.createdAt,
        updatedAt: noteMeta.updatedAt,
      };

      await deleteNoteFile(dirHandle, note);

      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setMarkdown("");
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleArchiveNote = async (noteId: string) => {
    if (!dirHandle || !passphrase) return;

    try {
      const notes = await listNotes(dirHandle, passphrase, true);
      const noteMeta = notes.find((n) => n.id === noteId);
      if (!noteMeta) return;

      const date = new Date(noteMeta.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const slug =
        noteMeta.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "") || "untitled";
      const filePath = `notes/${year}/${month}/${day}/${slug}.md.enc`;

      const note = await loadNote(dirHandle, filePath, passphrase);
      await archiveNoteFile(dirHandle, note, passphrase);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to archive note:", error);
    }
  };

  // Show setup wizard if no repo is selected
  if (!dirHandle) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <SetupWizard />
      </main>
    );
  }

  // Show locked screen if repo exists but is locked
  if (!isUnlocked) {
    return <LockedScreen />;
  }

  return (
    <div className={`flex flex-col h-screen ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      {/* Global Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {!isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h1 className="text-lg font-semibold">LocalNote</h1>
            </div>
            {currentNote && !isFullscreen && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentNote.title}</span>
                  {isSaving && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Save className="h-3 w-3 animate-pulse" />
                      Saving...
                    </span>
                  )}
                  {!isSaving && lastSaved && (
                    <span className="text-xs text-muted-foreground">
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isFullscreen && <TemplateSelector onSelectTemplate={handleTemplateSelect} />}
            {!isFullscreen && <KanbanSyntaxHelp />}
            {currentNote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <GitSync />
            <SettingsDialog />
            <LockButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {!sidebarCollapsed && !isFullscreen && (
          <NotesSidebar
            currentNoteId={currentNote?.id || null}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
            onArchiveNote={handleArchiveNote}
            onDeleteNote={handleDeleteNote}
            refreshTrigger={refreshTrigger}
          />
        )}

        <main className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="notes" className="flex-1 flex flex-col">
            {!isFullscreen && (
              <div className="border-b px-4">
                <TabsList>
                  <TabsTrigger value="notes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <Kanban className="h-4 w-4" />
                    Kanban
                  </TabsTrigger>
                </TabsList>
              </div>
            )}

            <TabsContent value="notes" className="flex-1 overflow-auto m-0 p-6">

              {currentNote ? (
                <TiptapEditor
                  content={markdown}
                  onChange={setMarkdown}
                  placeholder="Start writing your note..."
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg mb-2">No note selected</p>
                  <p className="text-sm">
                    Select a note from the sidebar or create a new one
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="kanban" className="flex-1 overflow-auto m-0 p-6">
              <KanbanBoard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
