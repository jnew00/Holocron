"use client";

import { useState, useCallback } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { useNoteOperations } from "@/hooks/useNoteOperations";
import { useKanbanBoards } from "@/hooks/useKanbanBoards";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePageHandlers } from "@/hooks/usePageHandlers";
import { useKanbanSync } from "@/hooks/useKanbanSync";

export default function Home() {
  const { isUnlocked, repoPath, passphrase, isLoading } = useRepo();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [boardSyncTrigger, setBoardSyncTrigger] = useState(0);

  // Use custom hooks for note operations and kanban boards
  const noteOps = useNoteOperations(repoPath);
  const { kanbanBoards } = useKanbanBoards(repoPath, refreshTrigger);

  // Page-level handlers that coordinate refresh triggers
  const handlers = usePageHandlers({
    noteOps,
    setRefreshTrigger,
    setActiveTab,
  });

  // Memoized callbacks for child components
  const handleBoardsChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleBoardUpdate = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleBoardSync = useCallback(() => {
    setBoardSyncTrigger(prev => prev + 1);
  }, []);

  // Auto-save hook
  useAutoSave({
    currentNote: noteOps.currentNote,
    markdown: noteOps.markdown,
    repoPath,
    onSave: noteOps.handleSave,
  });

  // Auto-sync kanban board when switching to a board tab
  useKanbanSync({
    activeTab,
    onSync: handleBoardSync,
  });

  // Show loading state while checking for saved config
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

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
      <AppHeader
        currentNote={noteOps.currentNote}
        isSaving={noteOps.isSaving}
        lastSaved={noteOps.lastSaved}
        isFullscreen={isFullscreen}
        kanbanBoards={kanbanBoards}
        onBoardsChange={handleBoardsChange}
        onTemplateSelect={handlers.handleTemplateSelect}
      />

      {/* Main Content Area */}
      <MainLayout
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapse={setSidebarCollapsed}
        currentNoteId={noteOps.currentNote?.path || null}
        onSelectNote={handlers.handleSelectNote}
        onNewNote={handlers.handleNewNote}
        onArchiveNote={handlers.handleArchiveNote}
        onDeleteNote={handlers.handleDeleteNote}
        refreshTrigger={refreshTrigger}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFullscreen={isFullscreen}
        onFullscreenToggle={setIsFullscreen}
        currentNoteTitle={noteOps.currentNote?.title}
        hasCurrentNote={!!noteOps.currentNote}
        markdown={noteOps.markdown}
        onMarkdownChange={noteOps.setMarkdown}
        kanbanBoards={kanbanBoards}
        onBoardUpdate={handleBoardUpdate}
        boardSyncTrigger={boardSyncTrigger}
      />
    </div>
  );
}
