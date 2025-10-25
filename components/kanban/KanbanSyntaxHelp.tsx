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
              <div className="text-muted-foreground font-semibold mb-1">Default Board:</div>
              <code className="text-foreground block">- [ ] Task @kanban</code>
              <code className="text-foreground block">- [ ] Task @kanban:doing</code>
            </div>
            <div className="mt-3">
              <div className="text-muted-foreground font-semibold mb-1">Specific Board:</div>
              <code className="text-foreground block">- [ ] Task @jira</code>
              <code className="text-foreground block">- [ ] Task @default:review</code>
            </div>
            <div className="mt-3">
              <div className="text-muted-foreground font-semibold mb-1">Mark Complete:</div>
              <code className="text-foreground block">- [x] Done task @kanban</code>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Board IDs:</strong> Use the board ID shown in Board Management (e.g., @jira, @default)</p>
            <p><strong>Columns:</strong> todo, doing, review, done (case-insensitive)</p>
            <p><strong>Auto-sync:</strong> Tasks sync when you save the note</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
