"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { TemplateManager } from "@/components/templates/TemplateManager";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { BoardManagement } from "@/components/kanban/BoardManagement";
import { NotesSidebar } from "@/components/notes/NotesSidebar";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { GitSync } from "@/components/git/GitSync";
import { KanbanSyntaxHelp } from "@/components/kanban/KanbanSyntaxHelp";
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
import { useNoteOperations } from "@/hooks/useNoteOperations";
import { useKanbanBoards } from "@/hooks/useKanbanBoards";
import { useAutoSave } from "@/hooks/useAutoSave";

export default function Home() {
  const { isUnlocked, repoPath, passphrase } = useRepo();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [boardSyncTrigger, setBoardSyncTrigger] = useState(0);

  // Track previous tab to know when we switch TO kanban
  const previousTabRef = useRef<string>("notes");

  // Use custom hooks for note operations and kanban boards
  const noteOps = useNoteOperations(repoPath);
  const { kanbanBoards } = useKanbanBoards(repoPath, refreshTrigger);

  // Auto-save hook
  useAutoSave({
    currentNote: noteOps.currentNote,
    markdown: noteOps.markdown,
    repoPath,
    onSave: noteOps.handleSave,
  });

  // Auto-sync kanban board when switching to a board tab
  useEffect(() => {
    if (activeTab.startsWith("kanban-") && previousTabRef.current !== activeTab) {
      setBoardSyncTrigger((prev) => prev + 1);
    }
    previousTabRef.current = activeTab;
  }, [activeTab]);

  // Wrapper handlers that update refresh trigger
  const handleNewNote = async () => {
    const success = await noteOps.handleNewNote();
    if (success) setRefreshTrigger((prev) => prev + 1);
  };

  const handleTemplateSelect = async (template: any) => {
    const success = await noteOps.handleTemplateSelect(template);
    if (success) setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectNote = async (notePath: string) => {
    await noteOps.handleSelectNote(notePath);
    setActiveTab("notes");
  };

  const handleDeleteNote = async (notePath: string) => {
    const success = await noteOps.handleDeleteNote(notePath);
    if (success) setRefreshTrigger((prev) => prev + 1);
  };

  const handleArchiveNote = async (notePath: string) => {
    const success = await noteOps.handleArchiveNote(notePath);
    if (success) setRefreshTrigger((prev) => prev + 1);
  };

  const handleSave = async () => {
    const titleChanged = await noteOps.handleSave();
    if (titleChanged) setRefreshTrigger((prev) => prev + 1);
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
            <div className="flex items-center gap-3 relative">
              <div
                className="absolute inset-0 -inset-x-4 -inset-y-2 opacity-60 blur-xl pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, rgba(20,184,166,0.4) 0%, rgba(59,130,246,0.5) 50%, rgba(168,85,247,0.4) 100%)"
                }}
              />
              <div className="relative group" style={{ perspective: "1000px" }}>
                <Image
                  src="/tesseract.png"
                  alt="Holocron"
                  width={48}
                  height={48}
                  className="object-contain brightness-110 contrast-110 transition-all duration-700"
                  style={{
                    filter: "drop-shadow(-4px 0 8px rgba(20,184,166,0.6)) drop-shadow(4px 0 8px rgba(59,130,246,0.5)) brightness(1.1) contrast(1.1)",
                    transform: "rotateY(0deg)",
                    transition: "all 0.7s ease-in-out"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotateY(180deg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotateY(0deg)";
                  }}
                />
              </div>
              <h1
                className="text-4xl font-bold tracking-tight font-rajdhani relative"
                style={{
                  background: "linear-gradient(90deg, #14b8a6 0%, #3b82f6 50%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 8px rgba(20,184,166,0.5))"
                }}
              >
                Holocron
              </h1>
            </div>
            {noteOps.currentNote && !isFullscreen && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{noteOps.currentNote.title}</span>
                  {noteOps.isSaving && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Save className="h-3 w-3 animate-pulse" />
                      Saving...
                    </span>
                  )}
                  {!noteOps.isSaving && noteOps.lastSaved && (
                    <span className="text-xs text-muted-foreground">
                      Saved {noteOps.lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BoardManagement boards={kanbanBoards} onBoardsChange={() => setRefreshTrigger(prev => prev + 1)} />
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />
            <GitSync />
            <SettingsDialog />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {!sidebarCollapsed && !isFullscreen && (
          <NotesSidebar
            currentNoteId={noteOps.currentNote?.path || null}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="relative flex-1 flex flex-col min-h-0">
            {!isFullscreen && (
              <div className="border-b px-4 flex items-center justify-between flex-shrink-0">
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
                {noteOps.currentNote && (
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
                  {noteOps.currentNote?.title || "Note"}
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

            <TabsContent value="notes" className="m-0 p-6 data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col data-[state=active]:min-h-0">
              {noteOps.currentNote ? (
                <div className="flex-1 min-h-0">
                  <TiptapEditor
                    content={noteOps.markdown}
                    onChange={noteOps.setMarkdown}
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
                className="m-0 p-6 data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col data-[state=active]:min-h-0"
              >
                <div className="flex-shrink-0 flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{board.name}</h2>
                  <KanbanSyntaxHelp />
                </div>
                <div className="flex-1 min-h-0 h-0 overflow-y-auto">
                  <KanbanBoard
                    boardId={board.id}
                    onBoardUpdate={() => setRefreshTrigger(prev => prev + 1)}
                    syncTrigger={boardSyncTrigger}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
