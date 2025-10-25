import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch as GitBranchIcon, Plus, Trash2 } from "lucide-react";
import { GitBranch } from "@/lib/git/gitService";

interface GitBranchesTabProps {
  branches: GitBranch[];
  newBranchName: string;
  setNewBranchName: (name: string) => void;
  working: boolean;
  handleCreateBranch: () => Promise<void>;
  handleSwitchBranch: (branchName: string) => Promise<void>;
  handleDeleteBranch: (branchName: string) => Promise<void>;
}

export const GitBranchesTab = React.memo(function GitBranchesTab({
  branches,
  newBranchName,
  setNewBranchName,
  working,
  handleCreateBranch,
  handleSwitchBranch,
  handleDeleteBranch,
}: GitBranchesTabProps) {
  return (
    <div className="space-y-4 mt-4">
      {/* Create Branch */}
      <div className="space-y-2">
        <Label htmlFor="new-branch">Create New Branch</Label>
        <div className="flex gap-2">
          <Input
            id="new-branch"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="feature/my-feature"
          />
          <Button
            onClick={handleCreateBranch}
            disabled={working || !newBranchName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Branch List */}
      <div className="space-y-2">
        <Label>Branches</Label>
        <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
          {branches
            .filter((b) => !b.isRemote)
            .map((branch) => (
              <div
                key={branch.name}
                className="flex items-center justify-between p-3 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <GitBranchIcon className="h-4 w-4" />
                  <span className="text-sm font-mono">{branch.name}</span>
                  {branch.isCurrent && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      current
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {!branch.isCurrent && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSwitchBranch(branch.name)}
                        disabled={working}
                      >
                        Switch
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBranch(branch.name)}
                        disabled={working}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});
