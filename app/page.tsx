"use client";

import { useState, useEffect, useRef } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { useNoteOperations } from "@/hooks/useNoteOperations";
import { useKanbanBoards } from "@/hooks/useKanbanBoards";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePageHandlers } from "@/hooks/usePageHandlers";

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

  // Page-level handlers that coordinate refresh triggers
  const handlers = usePageHandlers({
    noteOps,
    setRefreshTrigger,
    setActiveTab,
  });

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
        onBoardsChange={() => setRefreshTrigger(prev => prev + 1)}
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
        onBoardUpdate={() => setRefreshTrigger(prev => prev + 1)}
        boardSyncTrigger={boardSyncTrigger}
      />
    </div>
  );
}
