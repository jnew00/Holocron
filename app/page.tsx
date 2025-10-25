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
  CheckCircle2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isUnlocked, repoPath, passphrase } = useRepo();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // DISABLED - Being migrated to server-side APIs
  /*
  // Auto-save every 2 seconds when content changes
  useEffect(() => {
    if (!currentNote || !repoPath || !passphrase) return;

    const timeoutId = setTimeout(async () => {
      if (markdown !== currentNote.content) {
        await handleSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [markdown, currentNote, repoPath, passphrase]);

  const handleNewNote = async () => {
    if (!repoPath || !passphrase) return;

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
  */

  // Show setup wizard if no repo is selected
  if (!repoPath || !isUnlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <SetupWizard />
      </main>
    );
  }

  // TEMPORARY: Show message that editor is being migrated
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">LocalNote - Passphrase System Working! 🎉</h1>
          <p className="text-muted-foreground">The new architecture is in place and functional</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Status Card */}
          <div className="bg-card border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              System Status
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repository:</span>
                <span className="font-mono text-xs">{repoPath?.split('/').pop()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unlocked:</span>
                <span className="text-green-600">✓ Yes (Auto-loaded)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passphrase:</span>
                <span className="text-green-600">✓ Encrypted & Stored</span>
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-card border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-semibold">✅ Working Features</h2>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Native OS folder picker</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Passphrase encrypted & persisted</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Auto-unlock on startup</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Git encryption/decryption ready</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Architecture Details */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">🔒 New Security Model</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Local Storage:</strong> Notes stored as plaintext .md files (fast editing)</p>
            <p><strong>Git Storage:</strong> Encrypted .md.enc files (secure in Bitbucket)</p>
            <p><strong>Config Storage:</strong> Passphrase encrypted with machine-specific key in <code className="bg-muted px-1 rounded">.localnote/config.json.enc</code></p>
            <p><strong>Multi-Directory:</strong> Each notes folder can have its own passphrase</p>
            <p><strong>Git-Safe:</strong> Config can be committed - encrypted per-machine</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">⏳ Next: Editor Migration</h2>
          <p className="text-sm">The note editor and file operations need to be migrated from FileSystemDirectoryHandle to server-side APIs. Core infrastructure is complete!</p>

          <div className="pt-2">
            <Button onClick={() => window.open('/settings', '_self')} variant="outline" className="mr-2">
              <Settings className="h-4 w-4 mr-2" />
              View Settings (Check Passphrase)
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold mb-2">Debug Info</summary>
            <div className="space-y-1 font-mono">
              <div>Repo Path: {repoPath}</div>
              <div>Is Unlocked: {isUnlocked ? 'true' : 'false'}</div>
              <div>Passphrase Length: {passphrase?.length || 0} chars</div>
              <div>Config Location: {repoPath}/.localnote/config.json.enc</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );

  // OLD CODE - needs to be migrated to use repoPath instead of dirHandle
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
