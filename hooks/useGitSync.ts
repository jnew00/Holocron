import { useState, useEffect, useCallback } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { useSettings } from "@/contexts/SettingsContext";
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
} from "@/lib/git/gitService";

interface UseGitSyncReturn {
  // State
  open: boolean;
  status: GitStatus | null;
  branches: GitBranch[];
  commitMessage: string;
  authorName: string;
  authorEmail: string;
  remote: string;
  newBranchName: string;
  working: boolean;
  error: string | null;
  success: string | null;
  conflictedFiles: string[];
  nextSyncTime: string;
  currentTime: Date;
  hasChanges: boolean;
  needsPush: boolean;
  folderName: string | null;

  // Setters
  setCommitMessage: (message: string) => void;
  setRemote: (remote: string) => void;
  setNewBranchName: (name: string) => void;

  // Handlers
  handleOpen: (isOpen: boolean) => void;
  handleCommit: () => Promise<void>;
  handlePush: () => Promise<void>;
  handlePull: () => Promise<void>;
  handleSyncAll: () => Promise<void>;
  handleCreateBranch: () => Promise<void>;
  handleSwitchBranch: (branchName: string) => Promise<void>;
  handleDeleteBranch: (branchName: string) => Promise<void>;
  loadGitConfig: () => Promise<void>;
  checkGitStatus: () => Promise<void>;
  loadBranches: () => Promise<void>;
}

export function useGitSync(): UseGitSyncReturn {
  const { repoPath, getDEK } = useRepo();
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
  const [nextSyncTime, setNextSyncTime] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const loadGitConfig = useCallback(async () => {
    if (!repoPath) return;

    try {
      const config = await getConfig(repoPath);
      setAuthorName(config.name);
      setAuthorEmail(config.email);
    } catch (err: any) {
      console.error("Failed to load git config:", err);
      setError(err.message);
    }
  }, [repoPath]);

  const checkGitStatus = useCallback(async () => {
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
          ...gitStatus.files.untracked, // Include untracked files (new notes)
        ];

        console.log('[useGitSync] All changed files:', allChangedFiles);

        if (allChangedFiles.length > 0) {
          // Extract note titles from file paths
          const noteTitles = allChangedFiles
            .filter(file => file.endsWith('.md') || file.endsWith('.md.enc'))
            .map(file => {
              // Extract filename without .md or .md.enc extension
              const fileName = file.split('/').pop()?.replace(/\.md(\.enc)?$/, '') || '';
              // Convert slug to readable title
              return fileName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            })
            .filter(Boolean);

          console.log('[useGitSync] Note titles extracted:', noteTitles);

          if (noteTitles.length > 0) {
            const action = gitStatus.files.added.length > 0 ? 'Add' : 'Update';
            const message = noteTitles.length === 1
              ? `${action} ${noteTitles[0]}`
              : `${action} ${noteTitles.length} notes: ${noteTitles.slice(0, 3).join(', ')}${noteTitles.length > 3 ? '...' : ''}`;
            console.log('[useGitSync] Setting commit message:', message);
            setCommitMessage(message);
          }
        }
      }
    } catch (err: any) {
      console.error("Git status check failed:", err);
      setError(err.message);
      setStatus(null);
    }
  }, [repoPath, commitMessage]);

  const loadBranches = useCallback(async () => {
    if (!repoPath) return;

    try {
      const branchList = await listBranches(repoPath);
      setBranches(branchList);
    } catch (err: any) {
      console.error("Failed to load branches:", err);
    }
  }, [repoPath]);

  const handleCommit = useCallback(async () => {
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
        dekBase64: getDEK() || undefined,
      });

      setSuccess("Changes committed successfully");
      setCommitMessage("");
      await checkGitStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }, [repoPath, commitMessage, authorName, authorEmail, getDEK, checkGitStatus]);

  const handlePush = useCallback(async () => {
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
  }, [repoPath, remote, checkGitStatus]);

  const handleSyncAll = useCallback(async () => {
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
        dekBase64: getDEK() || undefined,
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
  }, [repoPath, commitMessage, authorName, authorEmail, getDEK, remote, checkGitStatus]);

  const handlePull = useCallback(async () => {
    if (!repoPath) return;

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await pull(repoPath, remote, undefined, getDEK() || undefined);

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
  }, [repoPath, remote, getDEK, checkGitStatus]);

  const handleCreateBranch = useCallback(async () => {
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
  }, [repoPath, newBranchName, checkGitStatus, loadBranches]);

  const handleSwitchBranch = useCallback(async (branchName: string) => {
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
  }, [repoPath, checkGitStatus, loadBranches]);

  const handleDeleteBranch = useCallback(async (branchName: string) => {
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
  }, [repoPath, loadBranches]);

  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadGitConfig();
      checkGitStatus();
      loadBranches();
    }
  }, [loadGitConfig, checkGitStatus, loadBranches]);

  // Calculate next sync time
  useEffect(() => {
    const calculateNextSync = () => {
      const now = new Date();
      setCurrentTime(now);

      let nextIntervalSync: Date | null = null;
      let nextScheduledSync: Date | null = null;

      // Calculate next interval sync
      if (settings.autoSyncEnabled) {
        nextIntervalSync = new Date(now.getTime() + settings.autoSyncInterval * 60 * 1000);
      }

      // Calculate next scheduled sync
      if (settings.autoSyncScheduleEnabled && settings.autoSyncScheduleDays.length > 0) {
        const [hours, minutes] = settings.autoSyncScheduleTime.split(":").map(Number);

        // Start with today
        let candidate = new Date();
        candidate.setHours(hours, minutes, 0, 0);

        // If today's time has passed, start from tomorrow
        if (candidate <= now) {
          candidate.setDate(candidate.getDate() + 1);
        }

        // Find next valid day
        let attempts = 0;
        while (!settings.autoSyncScheduleDays.includes(candidate.getDay()) && attempts < 7) {
          candidate.setDate(candidate.getDate() + 1);
          attempts++;
        }

        if (attempts < 7) {
          nextScheduledSync = candidate;
        }
      }

      // Determine which sync comes first
      let nextSync: Date | null = null;
      let syncType = "";

      if (nextIntervalSync && nextScheduledSync) {
        if (nextIntervalSync < nextScheduledSync) {
          nextSync = nextIntervalSync;
          syncType = "interval";
        } else {
          nextSync = nextScheduledSync;
          syncType = "scheduled";
        }
      } else if (nextIntervalSync) {
        nextSync = nextIntervalSync;
        syncType = "interval";
      } else if (nextScheduledSync) {
        nextSync = nextScheduledSync;
        syncType = "scheduled";
      }

      if (nextSync) {
        const timeUntil = nextSync.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeUntil / 60000);
        const hoursUntil = Math.floor(minutesUntil / 60);
        const daysUntil = Math.floor(hoursUntil / 24);

        let timeStr = "";
        if (daysUntil > 0) {
          timeStr = `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;
        } else if (hoursUntil > 0) {
          const remainingMinutes = minutesUntil % 60;
          timeStr = `in ${hoursUntil}h ${remainingMinutes}m`;
        } else if (minutesUntil > 0) {
          timeStr = `in ${minutesUntil} minute${minutesUntil > 1 ? "s" : ""}`;
        } else {
          timeStr = "soon";
        }

        const dateStr = nextSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setNextSyncTime(`${timeStr} (${dateStr})`);
      } else {
        setNextSyncTime("");
      }
    };

    if (open && (settings.autoSyncEnabled || settings.autoSyncScheduleEnabled)) {
      calculateNextSync();
      const interval = setInterval(calculateNextSync, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    } else {
      setNextSyncTime("");
    }
  }, [open, settings.autoSyncEnabled, settings.autoSyncInterval, settings.autoSyncScheduleEnabled, settings.autoSyncScheduleTime, settings.autoSyncScheduleDays]);

  // Poll git status every 30 seconds when not in dialog
  useEffect(() => {
    if (!open && repoPath) {
      checkGitStatus();
      const interval = setInterval(checkGitStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [open, repoPath, checkGitStatus]);

  const hasChanges = status ? status.hasChanges : false;
  const needsPush = status ? status.ahead > 0 : false;

  // Extract folder name from repoPath
  const folderName = repoPath ? repoPath.split('/').pop() || null : null;

  return {
    // State
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
    currentTime,
    hasChanges,
    needsPush,
    folderName,

    // Setters
    setCommitMessage,
    setRemote,
    setNewBranchName,

    // Handlers
    handleOpen,
    handleCommit,
    handlePush,
    handlePull,
    handleSyncAll,
    handleCreateBranch,
    handleSwitchBranch,
    handleDeleteBranch,
    loadGitConfig,
    checkGitStatus,
    loadBranches,
  };
}
