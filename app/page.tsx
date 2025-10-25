"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { BoardManagement } from "@/components/kanban/BoardManagement";
import { NotesSidebar } from "@/components/notes/NotesSidebar";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { GitSync } from "@/components/git/GitSync";
import { KanbanSyntaxHelp } from "@/components/kanban/KanbanSyntaxHelp";
import { NoteTemplate } from "@/lib/templates/templates";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";
import { addFrontmatter, extractFrontmatter, updateContent } from "@/lib/notes/frontmatter";
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

// Note interface (matches old format)
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  path?: string; // Filesystem path relative to notes/
  type?: string;
}

export default function Home() {
  const { isUnlocked, repoPath, passphrase } = useRepo();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [noteFrontmatter, setNoteFrontmatter] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [kanbanBoards, setKanbanBoards] = useState<KanbanBoardType[]>([]);

  // Helper function to generate note path
  const generateNotePath = (title: string, createdAt: string): string => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const slug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "untitled";
    return `${year}/${month}/${day}/${slug}.md`;
  };

  // Helper to generate unique note ID
  const generateNoteId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Load all kanban boards
  useEffect(() => {
    const loadBoards = async () => {
      if (!repoPath) return;

      console.log("Loading kanban boards...");

      try {
        const response = await fetch(
          `/api/kanban/list?repoPath=${encodeURIComponent(repoPath)}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Found board files:", data.boards);

          const boards: KanbanBoardType[] = [];
          for (const boardFile of data.boards) {
            try {
              const boardResponse = await fetch(
                `/api/notes/read?repoPath=${encodeURIComponent(repoPath)}&notePath=${encodeURIComponent(boardFile.path)}`
              );
              if (boardResponse.ok) {
                const boardData = await boardResponse.json();
                const board = JSON.parse(boardData.content);
                console.log("Loaded board:", board.name, board.id);
                boards.push(board);
              }
            } catch (err) {
              console.error(`Failed to load board ${boardFile.path}:`, err);
            }
          }
          console.log("Total boards loaded:", boards.length);
          setKanbanBoards(boards);
        }
      } catch (error) {
        console.error("Failed to load kanban boards:", error);
      }
    };

    loadBoards();
  }, [repoPath, refreshTrigger]);

  // Auto-save every 2 seconds when content changes
  useEffect(() => {
    if (!currentNote || !repoPath) return;

    const timeoutId = setTimeout(async () => {
      // Extract content from currentNote (without frontmatter) to compare
      const { content: currentContentWithoutFrontmatter } = extractFrontmatter(currentNote.content);
      if (markdown.trim() !== currentContentWithoutFrontmatter.trim()) {
        await handleSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [markdown, currentNote, repoPath]);

  const handleNewNote = async () => {
    if (!repoPath) return;

    const baseContent = "# Untitled Note\n\n";
    const frontmatter = { type: "note" };
    const contentWithFrontmatter = addFrontmatter(baseContent, frontmatter);

    const newNote: Note = {
      id: generateNoteId(),
      title: "Untitled Note",
      content: contentWithFrontmatter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "note",
    };

    newNote.path = generateNotePath(newNote.title, newNote.createdAt);

    // Save the note immediately so it appears in the sidebar
    try {
      const response = await fetch("/api/notes/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          notePath: newNote.path,
          content: contentWithFrontmatter,
        }),
      });

      if (response.ok) {
        setCurrentNote(newNote);
        setMarkdown(baseContent); // Only show content, not frontmatter
        setNoteFrontmatter(frontmatter); // Store frontmatter separately
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleTemplateSelect = async (template: NoteTemplate) => {
    if (!repoPath) return;

    // Add frontmatter with the template type to the content
    const frontmatter = { type: template.type };
    const contentWithFrontmatter = addFrontmatter(template.content, frontmatter);

    const newNote: Note = {
      id: generateNoteId(),
      title: template.name,
      content: contentWithFrontmatter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: template.type,
    };

    newNote.path = generateNotePath(newNote.title, newNote.createdAt);

    // Save the note immediately so it appears in the sidebar
    try {
      const response = await fetch("/api/notes/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          notePath: newNote.path,
          content: contentWithFrontmatter,
        }),
      });

      if (response.ok) {
        setCurrentNote(newNote);
        setMarkdown(template.content); // Only show content, not frontmatter
        setNoteFrontmatter(frontmatter); // Store frontmatter separately
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to create note from template:", error);
    }
  };

  const handleSelectNote = async (notePath: string) => {
    if (!repoPath) return;

    try {
      const response = await fetch(
        `/api/notes/read?repoPath=${encodeURIComponent(repoPath)}&notePath=${encodeURIComponent(notePath)}`
      );

      if (response.ok) {
        const data = await response.json();

        // Extract frontmatter and metadata from content
        const { data: frontmatter, content: markdownContent } = extractFrontmatter(data.content);
        const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : "Untitled";

        const note: Note = {
          id: generateNoteId(), // Generate fresh ID for tracking
          title,
          content: data.content,
          path: notePath,
          createdAt: data.modified,
          updatedAt: data.modified,
          type: frontmatter.type || "note",
        };

        setCurrentNote(note);
        setMarkdown(markdownContent); // Only show content, not frontmatter
        setNoteFrontmatter(frontmatter); // Store frontmatter separately
      }
    } catch (error) {
      console.error("Failed to load note:", error);
    }
  };

  const handleSave = async () => {
    if (!currentNote || !repoPath || !currentNote.path) return;

    setIsSaving(true);
    try {
      // Extract title from markdown (first H1)
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : "Untitled";

      // Merge frontmatter with markdown content for saving
      const mergedFrontmatter = {
        ...noteFrontmatter,
        type: currentNote.type || noteFrontmatter.type || "note",
      };
      const contentToSave = addFrontmatter(markdown, mergedFrontmatter);

      const updatedNote: Note = {
        ...currentNote,
        title,
        content: contentToSave,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/notes/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          notePath: currentNote.path,
          content: contentToSave,
        }),
      });

      if (response.ok) {
        setCurrentNote(updatedNote);
        setLastSaved(new Date());
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (notePath: string) => {
    if (!repoPath) return;

    try {
      const response = await fetch(
        `/api/notes/delete?repoPath=${encodeURIComponent(repoPath)}&notePath=${encodeURIComponent(notePath)}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        if (currentNote?.path === notePath) {
          setCurrentNote(null);
          setMarkdown("");
        }
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleArchiveNote = async (notePath: string) => {
    // Archive functionality - move to archive/ directory
    if (!repoPath) return;

    try {
      // Read the note
      const readResponse = await fetch(
        `/api/notes/read?repoPath=${encodeURIComponent(repoPath)}&notePath=${encodeURIComponent(notePath)}`
      );

      if (!readResponse.ok) return;

      const data = await readResponse.json();

      // Create archive path
      const archivePath = `archive/${notePath}`;

      // Write to archive
      await fetch("/api/notes/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          notePath: archivePath,
          content: data.content,
        }),
      });

      // Delete original
      await handleDeleteNote(notePath);

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to archive note:", error);
    }
  };

  // Show setup wizard if no repo is selected
  if (!repoPath || !isUnlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <SetupWizard />
      </main>
    );
  }

  // Main editor UI
  return (
    <div className={`flex flex-col h-screen ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      {/* Global Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/holocron.png"
                alt="Holocron"
                width={48}
                height={48}
                className="object-contain"
              />
              <h1 className="text-2xl font-bold tracking-tight">Holocron</h1>
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
            <BoardManagement boards={kanbanBoards} onBoardsChange={() => setRefreshTrigger(prev => prev + 1)} />
            <GitSync />
            <SettingsDialog />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {!sidebarCollapsed && !isFullscreen && (
          <NotesSidebar
            currentNoteId={currentNote?.path || null}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
            onArchiveNote={handleArchiveNote}
            onDeleteNote={handleDeleteNote}
            onCollapse={() => setSidebarCollapsed(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {sidebarCollapsed && !isFullscreen && (
          <div className="border-r bg-muted/30 flex flex-col items-center py-4 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              title="Show sidebar"
              className="h-8 w-8 p-0"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Tabs defaultValue="notes" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {!isFullscreen && (
              <div className="border-b px-4 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="notes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </TabsTrigger>
                  {kanbanBoards.map((board) => (
                    <TabsTrigger
                      key={board.id}
                      value={`kanban-${board.id}`}
                      className="flex items-center gap-2"
                    >
                      {board.icon ? (
                        board.icon.startsWith('data:') ? (
                          <img src={board.icon} alt={board.name} className="h-4 w-4 rounded" />
                        ) : (
                          <span className="text-lg">{board.icon}</span>
                        )
                      ) : (
                        <Kanban className="h-4 w-4" />
                      )}
                      {board.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {currentNote && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(true)}
                    title="Fullscreen"
                    className="h-8 w-8 p-0"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {isFullscreen && (
              <div className="border-b px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentNote?.title || "Note"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  title="Exit fullscreen"
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <TabsContent value="notes" className="m-0 p-6 h-full flex flex-col">
              {currentNote ? (
                <div className="flex-1 min-h-0">
                  <TiptapEditor
                    content={markdown}
                    onChange={setMarkdown}
                    placeholder="Start writing your note..."
                    kanbanBoards={kanbanBoards}
                  />
                </div>
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

            {kanbanBoards.map((board) => (
              <TabsContent
                key={board.id}
                value={`kanban-${board.id}`}
                className="flex-1 overflow-auto m-0 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{board.name}</h2>
                  <KanbanSyntaxHelp />
                </div>
                <KanbanBoard boardId={board.id} onBoardUpdate={() => setRefreshTrigger(prev => prev + 1)} />
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
