"use client";

import { memo } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { BoardManagement } from "@/components/kanban/BoardManagement";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { GitSync } from "@/components/git/GitSync";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Save } from "lucide-react";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";
import { NoteTemplate } from "@/lib/templates/templates";

interface AppHeaderProps {
  currentNote: {
    title: string;
  } | null;
  isSaving: boolean;
  lastSaved: Date | null;
  isFullscreen: boolean;
  kanbanBoards: KanbanBoardType[];
  onBoardsChange: () => void;
  onTemplateSelect: (template: NoteTemplate) => void;
}

export const AppHeader = memo(function AppHeader({
  currentNote,
  isSaving,
  lastSaved,
  isFullscreen,
  kanbanBoards,
  onBoardsChange,
  onTemplateSelect,
}: AppHeaderProps) {
  return (
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
          <BoardManagement boards={kanbanBoards} onBoardsChange={onBoardsChange} />
          <TemplateSelector onSelectTemplate={onTemplateSelect} />
          <GitSync />
          <SettingsDialog />
        </div>
      </div>
    </header>
  );
});
