import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderGit2, Check } from "lucide-react";

interface GitSettingsTabProps {
  repoPath: string | null;
  repoPathInput: string;
  setRepoPathInput: (value: string) => void;
  saved: boolean;
  handleSaveRepoPath: () => void;
}

export const GitSettingsTab = React.memo(function GitSettingsTab({
  repoPath,
  repoPathInput,
  setRepoPathInput,
  saved,
  handleSaveRepoPath,
}: GitSettingsTabProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <FolderGit2 className="h-4 w-4" />
        Git Repository Path (Optional)
      </h3>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="repo-path">
            Full path to your notes directory
          </Label>
          <p className="text-xs text-muted-foreground">
            <strong>Only needed if you want to use Git sync.</strong> This is the full file system path
            where your encrypted notes are stored (the same folder you selected during setup).
          </p>
          <div className="flex gap-2">
            <Input
              id="repo-path"
              value={repoPathInput}
              onChange={(e) => setRepoPathInput(e.target.value)}
              placeholder="/Users/YourName/Documents/MyNotes"
              className="font-mono text-xs"
            />
            <Button onClick={handleSaveRepoPath} variant={saved ? "outline" : "default"}>
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
          {repoPath && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Current: {repoPath}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
