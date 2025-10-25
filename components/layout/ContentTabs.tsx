"use client";

import { memo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Kanban, Maximize2, Minimize2 } from "lucide-react";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";

interface ContentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  kanbanBoards: KanbanBoardType[];
  isFullscreen: boolean;
  onFullscreenToggle: (fullscreen: boolean) => void;
  currentNoteTitle?: string;
  hasCurrentNote: boolean;
  children: React.ReactNode;
}

export const ContentTabs = memo(function ContentTabs({
  activeTab,
  onTabChange,
  kanbanBoards,
  isFullscreen,
  onFullscreenToggle,
  currentNoteTitle,
  hasCurrentNote,
  children,
}: ContentTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="relative flex-1 flex flex-col min-h-0">
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
          {hasCurrentNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFullscreenToggle(true)}
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
            {currentNoteTitle || "Note"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFullscreenToggle(false)}
            title="Exit fullscreen"
            className="h-8 w-8 p-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {children}
    </Tabs>
  );
});
