"use client";

import { useGitSync } from "@/hooks/useGitSync";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch as GitBranchIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { GitStatusBar } from "@/components/git/GitStatusBar";
import { AutoSyncStatus } from "@/components/git/AutoSyncStatus";
import { GitSyncTab } from "@/components/git/GitSyncTab";
import { GitBranchesTab } from "@/components/git/GitBranchesTab";

export function GitSync() {
  const { settings } = useSettings();
  const {
    open,
    status,
    branches,
    commitMessage,
    authorName,
    authorEmail,
    remote,
    newBranchName,
    working,
    error,
    success,
    conflictedFiles,
    nextSyncTime,
    hasChanges,
    needsPush,
    folderName,
    setCommitMessage,
    setRemote,
    setNewBranchName,
    handleOpen,
    handleCommit,
    handlePush,
    handlePull,
    handleSyncAll,
    handleCreateBranch,
    handleSwitchBranch,
    handleDeleteBranch,
  } = useGitSync();

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Git Sync" className="relative">
          <GitBranchIcon className="h-4 w-4 mr-1" />
          <div className="flex items-center gap-1 text-xs font-mono">
            {folderName && (
              <>
                <span className="text-muted-foreground">{folderName}</span>
                {status?.branch && <span className="text-muted-foreground">/</span>}
              </>
            )}
            {status?.branch && <span>{status.branch}</span>}
          </div>
          {(hasChanges || needsPush) && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Git Sync</DialogTitle>
          <DialogDescription>
            Commit and sync your notes with a remote Git repository using system Git and SSH
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <GitStatusBar status={status} />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-sm">{error}</p>
                {conflictedFiles.length > 0 && (
                  <ul className="text-xs mt-2 space-y-1">
                    {conflictedFiles.map((file) => (
                      <li key={file} className="font-mono">
                        {file}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <AutoSyncStatus settings={settings} nextSyncTime={nextSyncTime} />

          {status && (
            <Tabs defaultValue="sync" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sync">Sync</TabsTrigger>
                <TabsTrigger value="branches">Branches</TabsTrigger>
              </TabsList>

              <TabsContent value="sync">
                <GitSyncTab
                  commitMessage={commitMessage}
                  setCommitMessage={setCommitMessage}
                  working={working}
                  status={status}
                  authorName={authorName}
                  authorEmail={authorEmail}
                  remote={remote}
                  setRemote={setRemote}
                  handleSyncAll={handleSyncAll}
                  handleCommit={handleCommit}
                  handlePush={handlePush}
                  handlePull={handlePull}
                />
              </TabsContent>

              <TabsContent value="branches">
                <GitBranchesTab
                  branches={branches}
                  newBranchName={newBranchName}
                  setNewBranchName={setNewBranchName}
                  working={working}
                  handleCreateBranch={handleCreateBranch}
                  handleSwitchBranch={handleSwitchBranch}
                  handleDeleteBranch={handleDeleteBranch}
                />
              </TabsContent>
            </Tabs>
          )}

          <p className="text-xs text-muted-foreground">
            Uses system Git CLI with your existing SSH credentials. Ensure Git remote is configured.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
