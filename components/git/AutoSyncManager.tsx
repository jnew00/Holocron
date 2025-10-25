"use client";

import { useRepo } from "@/contexts/RepoContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useScheduledSync } from "@/hooks/useScheduledSync";

/**
 * AutoSyncManager - Handles automatic git sync on a schedule
 * This component doesn't render anything, it just manages the sync timer
 */
export function AutoSyncManager() {
  const { repoPath, passphrase, isUnlocked } = useRepo();
  const { settings } = useSettings();

  // Interval-based auto-sync
  useAutoSync({
    enabled: settings.autoSyncEnabled,
    interval: settings.autoSyncInterval,
    repoPath,
    passphrase,
    isUnlocked,
  });

  // Time-based scheduled sync
  useScheduledSync({
    enabled: settings.autoSyncScheduleEnabled,
    scheduleTime: settings.autoSyncScheduleTime,
    scheduleDays: settings.autoSyncScheduleDays,
    repoPath,
    passphrase,
    isUnlocked,
  });

  return null;
}
