"use client";

import { useState, useEffect, useRef } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainLayout } from "@/components/layout/MainLayout";
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
      <AppHeader
        currentNote={noteOps.currentNote}
        isSaving={noteOps.isSaving}
        lastSaved={noteOps.lastSaved}
        isFullscreen={isFullscreen}
        kanbanBoards={kanbanBoards}
        onBoardsChange={() => setRefreshTrigger(prev => prev + 1)}
        onTemplateSelect={handleTemplateSelect}
      />

      {/* Main Content Area */}
      <MainLayout
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapse={setSidebarCollapsed}
        currentNoteId={noteOps.currentNote?.path || null}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onArchiveNote={handleArchiveNote}
        onDeleteNote={handleDeleteNote}
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
