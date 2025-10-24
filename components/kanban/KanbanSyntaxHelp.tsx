"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function KanbanSyntaxHelp() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" title="Kanban Task Syntax Help">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">Kanban Task Annotations</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Add tasks from your notes directly to the Kanban board using these annotations:
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono bg-muted p-3 rounded">
            <div>
              <div className="text-muted-foreground">Add to Backlog:</div>
              <code className="text-foreground">- [ ] Task description @kanban</code>
            </div>
            <div>
              <div className="text-muted-foreground mt-2">Add to specific column:</div>
              <code className="text-foreground">- [ ] Task @kanban:doing</code>
            </div>
            <div>
              <div className="text-muted-foreground mt-2">Mark as complete:</div>
              <code className="text-foreground">- [x] Done task @kanban</code>
            </div>
            <div>
              <div className="text-muted-foreground mt-2">Alternative syntax:</div>
              <code className="text-foreground">- [ ] Task #kanban</code>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Supported columns:</strong> backlog, doing, done</p>
            <p><strong>Auto-sync:</strong> Tasks sync to Kanban board when you save the note</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
