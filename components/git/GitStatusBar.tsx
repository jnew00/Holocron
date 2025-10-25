import React from "react";
import { CheckCircle2, AlertCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { GitStatus } from "@/lib/git/gitService";

interface GitStatusBarProps {
  status: GitStatus | null;
}

export const GitStatusBar = React.memo(function GitStatusBar({ status }: GitStatusBarProps) {
  if (!status) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <p className="text-sm">
          Unable to detect Git repository. Ensure Git is initialized and remote is configured with SSH.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <div className="flex-1">
        <p className="text-sm font-medium">Branch: {status.branch}</p>
        <p className="text-xs text-muted-foreground">
          {status.modified} modified • {status.added} added • {status.deleted} deleted • {status.untracked} untracked
        </p>
        {(status.ahead > 0 || status.behind > 0) && (
          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            {status.ahead > 0 && (
              <span className="flex items-center gap-1">
                <ArrowUpCircle className="h-3 w-3" />
                {status.ahead} ahead
              </span>
            )}
            {status.behind > 0 && (
              <span className="flex items-center gap-1">
                <ArrowDownCircle className="h-3 w-3" />
                {status.behind} behind
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
});
