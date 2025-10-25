import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GitCommit, Upload, Download, ArrowUpCircle } from "lucide-react";
import { GitStatus } from "@/lib/git/gitService";

interface GitSyncTabProps {
  commitMessage: string;
  setCommitMessage: (message: string) => void;
  working: boolean;
  status: GitStatus;
  authorName: string;
  authorEmail: string;
  remote: string;
  setRemote: (remote: string) => void;
  handleSyncAll: () => Promise<void>;
  handleCommit: () => Promise<void>;
  handlePush: () => Promise<void>;
  handlePull: () => Promise<void>;
}

export const GitSyncTab = React.memo(function GitSyncTab({
  commitMessage,
  setCommitMessage,
  working,
  status,
  authorName,
  authorEmail,
  remote,
  setRemote,
  handleSyncAll,
  handleCommit,
  handlePush,
  handlePull,
}: GitSyncTabProps) {
  return (
    <div className="space-y-4 mt-4">
      {/* Author Info Display */}
      {(authorName || authorEmail) && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <span>Committing as: {authorName} &lt;{authorEmail}&gt;</span>
        </div>
      )}

      {/* Main Sync All Section */}
      <div className="space-y-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
        <Label htmlFor="commit-message" className="text-base font-semibold">
          Sync All Changes
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          Add, encrypt, commit, and push all changes with one click
        </p>
        <Textarea
          id="commit-message"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message (auto-populated with changed notes)..."
          className="min-h-[80px]"
        />
        <Button
          onClick={handleSyncAll}
          disabled={working || !commitMessage.trim() || !status.hasChanges}
          className="w-full h-12 text-base"
          size="lg"
        >
          <ArrowUpCircle className="h-5 w-5 mr-2" />
          {working ? "Syncing..." : "Sync All"}
        </Button>
      </div>

      {/* Individual Steps Section */}
      <div className="pt-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">Individual Steps</p>

        {/* Commit Section */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="commit-only" className="text-sm">Commit Only</Label>
          <Button
            onClick={handleCommit}
            disabled={working || !commitMessage.trim() || !status.hasChanges}
            className="w-full"
            variant="outline"
          >
            <GitCommit className="h-4 w-4 mr-2" />
            {working ? "Committing..." : "Commit Changes"}
          </Button>
        </div>

        {/* Push/Pull Section */}
        <div className="space-y-2">
          <Label htmlFor="remote" className="text-sm">Push/Pull</Label>
          <Input
            id="remote"
            value={remote}
            onChange={(e) => setRemote(e.target.value)}
            placeholder="origin"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handlePull} disabled={working} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Pull
            </Button>
            <Button onClick={handlePush} disabled={working} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Push
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
