"use client";

import { useState, useEffect } from "react";
import { useRepo } from "@/contexts/RepoContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch as GitBranchIcon,
  GitCommit,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import {
  getStatus,
  getConfig,
  commit,
  push,
  pull,
  listBranches,
  createBranch,
  switchBranch,
  deleteBranch,
  GitStatus,
  GitBranch,
  GitConfig,
} from "@/lib/git/gitService";

export function GitSync() {
  const { repoPath, passphrase } = useRepo();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [authorName, setAuthorName] = useState("LocalNote User");
  const [authorEmail, setAuthorEmail] = useState("user@localnote.local");
  const [remote, setRemote] = useState("origin");
  const [newBranchName, setNewBranchName] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [conflictedFiles, setConflictedFiles] = useState<string[]>([]);

  const loadGitConfig = async () => {
    if (!repoPath) return;

    try {
      const config = await getConfig(repoPath);
      setAuthorName(config.name);
      setAuthorEmail(config.email);
    } catch (err: any) {
      console.error("Failed to load git config:", err);
      setError(err.message);
    }
  };

  const checkGitStatus = async () => {
    if (!repoPath) return;

    try {
      const gitStatus = await getStatus(repoPath);
      setStatus(gitStatus);

      // Auto-populate commit message if empty and there are changes
      if (!commitMessage && gitStatus.hasChanges && gitStatus.files) {
        const allChangedFiles = [
          ...gitStatus.files.added,
          ...gitStatus.files.modified,
          ...gitStatus.files.deleted,
        ];

        if (allChangedFiles.length > 0) {
          // Extract note titles from file paths
          const noteTitles = allChangedFiles
            .filter(file => file.endsWith('.md'))
            .map(file => {
              // Extract filename without .md extension
              const fileName = file.split('/').pop()?.replace('.md', '') || '';
              // Convert slug to readable title
              return fileName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            })
            .filter(Boolean);

          if (noteTitles.length > 0) {
            const action = gitStatus.files.added.length > 0 ? 'Add' : 'Update';
            const message = noteTitles.length === 1
              ? `${action} ${noteTitles[0]}`
              : `${action} ${noteTitles.length} notes: ${noteTitles.slice(0, 3).join(', ')}${noteTitles.length > 3 ? '...' : ''}`;
            setCommitMessage(message);
          }
        }
      }
    } catch (err: any) {
      console.error("Git status check failed:", err);
      setError(err.message);
      setStatus(null);
    }
  };

  const loadBranches = async () => {
    if (!repoPath) return;

    try {
      const branchList = await listBranches(repoPath);
      setBranches(branchList);
    } catch (err: any) {
      console.error("Failed to load branches:", err);
    }
  };

  const handleCommit = async () => {
    if (!repoPath || !commitMessage.trim()) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      await commit(repoPath, {
        message: commitMessage,
        author: {
          name: authorName,
          email: authorEmail,
        },
        passphrase: passphrase || undefined,
      });

      setSuccess("Changes committed successfully");
      setCommitMessage("");
      await checkGitStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handlePush = async () => {
    if (!repoPath) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      await push(repoPath, remote);
      setSuccess("Changes pushed to remote");
      await checkGitStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleSyncAll = async () => {
    if (!repoPath || !commitMessage.trim()) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Commit (which includes add and encrypt)
      setSuccess("Encrypting and committing changes...");
      await commit(repoPath, {
        message: commitMessage,
        author: {
          name: authorName,
          email: authorEmail,
        },
        passphrase: passphrase || undefined,
      });

      // Step 2: Push
      setSuccess("Pushing to remote...");
      await push(repoPath, remote);

      setSuccess("All changes synced successfully!");
      setCommitMessage("");
      await checkGitStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handlePull = async () => {
    if (!repoPath) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await pull(repoPath, remote, undefined, passphrase || undefined);

      if (result.hasConflicts) {
        setError(`Merge conflicts detected in ${result.conflictedFiles?.length || 0} files`);
        setConflictedFiles(result.conflictedFiles || []);
      } else {
        setSuccess("Changes pulled from remote");
        setConflictedFiles([]);
      }

      await checkGitStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!repoPath || !newBranchName.trim()) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      await createBranch(repoPath, newBranchName);
      setSuccess(`Created and switched to branch: ${newBranchName}`);
      setNewBranchName("");
      await checkGitStatus();
      await loadBranches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    if (!repoPath) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      await switchBranch(repoPath, branchName);
      setSuccess(`Switched to branch: ${branchName}`);
      await checkGitStatus();
      await loadBranches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (!repoPath) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteBranch(repoPath, branchName);
      setSuccess(`Deleted branch: ${branchName}`);
      await loadBranches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadGitConfig();
      checkGitStatus();
      loadBranches();
    }
  };

  // Poll git status every 30 seconds when not in dialog
  useEffect(() => {
    if (!open && repoPath) {
      checkGitStatus();
      const interval = setInterval(checkGitStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [open, repoPath]);

  const hasChanges = status && status.hasChanges;
  const needsPush = status && status.ahead > 0;

  // Extract folder name from repoPath
  const folderName = repoPath ? repoPath.split('/').pop() : null;

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
          {/* Status Bar */}
          {status && (
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
          )}

          {!status && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p className="text-sm">
                Unable to detect Git repository. Ensure Git is initialized and remote is configured with SSH.
              </p>
            </div>
          )}

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

          {/* Auto-Sync Status */}
          {(settings.autoSyncEnabled || settings.autoSyncScheduleEnabled) && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-500/20">
              <Clock className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">Auto-Sync Enabled</p>
                <div className="text-xs opacity-75 space-y-1">
                  {settings.autoSyncEnabled && (
                    <p>
                      Interval: Every {settings.autoSyncInterval} minute{settings.autoSyncInterval !== 1 ? 's' : ''}
                    </p>
                  )}
                  {settings.autoSyncScheduleEnabled && (
                    <p>
                      Scheduled: Daily at {settings.autoSyncScheduleTime} on{" "}
                      {settings.autoSyncScheduleDays.length === 7
                        ? "all days"
                        : settings.autoSyncScheduleDays
                            .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                            .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {status && (
            <Tabs defaultValue="sync" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sync">Sync</TabsTrigger>
                <TabsTrigger value="branches">Branches</TabsTrigger>
              </TabsList>

              <TabsContent value="sync" className="space-y-4 mt-4">
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
              </TabsContent>

              <TabsContent value="branches" className="space-y-4 mt-4">
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
