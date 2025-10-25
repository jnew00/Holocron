"use client";

import { memo } from "react";
import { SidebarContainer } from "@/components/layout/SidebarContainer";
import { ContentTabs } from "@/components/layout/ContentTabs";
import { NoteEditorContainer } from "@/components/notes/NoteEditorContainer";
import { KanbanTabContent } from "@/components/kanban/KanbanTabContent";
import { TabsContent } from "@/components/ui/tabs";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";

interface MainLayoutProps {
  // Sidebar props
  sidebarCollapsed: boolean;
  onSidebarCollapse: (collapsed: boolean) => void;
  currentNoteId: string | null;
  onSelectNote: (notePath: string) => void;
  onNewNote: () => void;
  onArchiveNote: (notePath: string) => void;
  onDeleteNote: (notePath: string) => void;
  refreshTrigger: number;

  // Content props
  activeTab: string;
  onTabChange: (tab: string) => void;
  isFullscreen: boolean;
  onFullscreenToggle: (fullscreen: boolean) => void;
  currentNoteTitle?: string;
  hasCurrentNote: boolean;

  // Editor props
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  kanbanBoards: KanbanBoardType[];

  // Kanban props
  onBoardUpdate: () => void;
  boardSyncTrigger: number;
}

export const MainLayout = memo(function MainLayout({
  sidebarCollapsed,
  onSidebarCollapse,
  currentNoteId,
  onSelectNote,
  onNewNote,
  onArchiveNote,
  onDeleteNote,
  refreshTrigger,
  activeTab,
  onTabChange,
  isFullscreen,
  onFullscreenToggle,
  currentNoteTitle,
  hasCurrentNote,
  markdown,
  onMarkdownChange,
  kanbanBoards,
  onBoardUpdate,
  boardSyncTrigger,
}: MainLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <SidebarContainer
        isCollapsed={sidebarCollapsed}
        onCollapse={onSidebarCollapse}
        isFullscreen={isFullscreen}
        currentNoteId={currentNoteId}
        onSelectNote={onSelectNote}
        onNewNote={onNewNote}
        onArchiveNote={onArchiveNote}
        onDeleteNote={onDeleteNote}
        refreshTrigger={refreshTrigger}
      />

      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ContentTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          kanbanBoards={kanbanBoards}
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
          currentNoteTitle={currentNoteTitle}
          hasCurrentNote={hasCurrentNote}
        >
          <TabsContent value="notes" className="m-0 p-6 data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:flex-col data-[state=active]:min-h-0">
            <NoteEditorContainer
              markdown={markdown}
              onChange={onMarkdownChange}
              hasNote={hasCurrentNote}
              kanbanBoards={kanbanBoards}
            />
          </TabsContent>

          <KanbanTabContent
            boards={kanbanBoards}
            onBoardUpdate={onBoardUpdate}
            syncTrigger={boardSyncTrigger}
          />
        </ContentTabs>
      </main>
    </div>
  );
});
