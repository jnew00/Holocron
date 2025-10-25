"use client";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanSyntaxHelp } from "@/components/kanban/KanbanSyntaxHelp";
import { TabsContent } from "@/components/ui/tabs";
import { KanbanBoard as KanbanBoardType } from "@/lib/kanban/types";

interface KanbanTabContentProps {
  boards: KanbanBoardType[];
  onBoardUpdate: () => void;
  syncTrigger: number;
}

export function KanbanTabContent({
  boards,
  onBoardUpdate,
  syncTrigger,
}: KanbanTabContentProps) {
  return (
    <>
      {boards.map((board) => (
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
              onBoardUpdate={onBoardUpdate}
              syncTrigger={syncTrigger}
            />
          </div>
        </TabsContent>
      ))}
    </>
  );
}
