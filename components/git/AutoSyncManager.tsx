"use client";

import { useEffect, useRef } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { useSettings } from "@/contexts/SettingsContext";
import { commit, push, getStatus, getConfig } from "@/lib/git/gitService";

/**
 * AutoSyncManager - Handles automatic git sync on a schedule
 * This component doesn't render anything, it just manages the sync timer
 */
export function AutoSyncManager() {
  const { repoPath, passphrase, isUnlocked } = useRepo();
  const { settings } = useSettings();
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scheduleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncAttemptRef = useRef<Date | null>(null);
  const lastScheduledSyncDateRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    // Only set up auto-sync if enabled and repo is configured
    if (
      !settings.autoSyncEnabled ||
      !repoPath ||
      !passphrase ||
      !isUnlocked
    ) {
      return;
    }

    console.log(
      `[AutoSync] Setting up auto-sync every ${settings.autoSyncInterval} minutes`
    );

    const performSync = async () => {
      // Prevent multiple syncs running at once
      const now = new Date();
      if (
        lastSyncAttemptRef.current &&
        now.getTime() - lastSyncAttemptRef.current.getTime() < 60000
      ) {
        console.log("[AutoSync] Skipping sync - too soon since last attempt");
        return;
      }

      lastSyncAttemptRef.current = now;

      try {
        console.log("[AutoSync] Starting automatic sync...");

        // Check if there are changes to sync
        const status = await getStatus(repoPath);
        if (!status.hasChanges) {
          console.log("[AutoSync] No changes to sync");
          return;
        }

        // Get git config for commit author
        const config = await getConfig(repoPath);

        // Auto-generate commit message
        const allChangedFiles = [
          ...(status.files?.added || []),
          ...(status.files?.modified || []),
          ...(status.files?.deleted || []),
        ];

        const noteTitles = allChangedFiles
          .filter((file) => file.endsWith(".md"))
          .map((file) => {
            const fileName = file.split("/").pop()?.replace(".md", "") || "";
            return fileName
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          })
          .filter(Boolean);

        const commitMessage =
          noteTitles.length > 0
            ? `Auto-sync: ${noteTitles.length} note${noteTitles.length > 1 ? "s" : ""} updated`
            : "Auto-sync: Updates";

        // Commit
        console.log("[AutoSync] Committing changes...");
        await commit(repoPath, {
          message: commitMessage,
          author: {
            name: config.name,
            email: config.email,
          },
          passphrase: passphrase,
        });

        // Push
        console.log("[AutoSync] Pushing to remote...");
        await push(repoPath, "origin");

        console.log("[AutoSync] Sync completed successfully");
      } catch (error: any) {
        console.error("[AutoSync] Sync failed:", error.message);
        // Don't throw - we'll try again on next interval
      }
    };

    // Run sync immediately if there are pending changes (after a short delay)
    const initialTimeout = setTimeout(performSync, 10000); // 10 seconds after app starts

    // Set up recurring sync
    const intervalMs = settings.autoSyncInterval * 60 * 1000;
    syncTimerRef.current = setInterval(performSync, intervalMs);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [
    settings.autoSyncEnabled,
    settings.autoSyncInterval,
    repoPath,
    passphrase,
    isUnlocked,
  ]);

  // Set up scheduled sync (time-based)
  useEffect(() => {
    // Clear any existing schedule timer
    if (scheduleTimerRef.current) {
      clearInterval(scheduleTimerRef.current);
      scheduleTimerRef.current = null;
    }

    // Only set up scheduled sync if enabled and repo is configured
    if (
      !settings.autoSyncScheduleEnabled ||
      !repoPath ||
      !passphrase ||
      !isUnlocked ||
      settings.autoSyncScheduleDays.length === 0
    ) {
      return;
    }

    console.log(
      `[AutoSync] Setting up scheduled sync at ${settings.autoSyncScheduleTime} on days: ${settings.autoSyncScheduleDays.join(", ")}`
    );

    const checkScheduledSync = async () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const currentDate = now.toDateString();

      // Check if today is in the selected days
      if (!settings.autoSyncScheduleDays.includes(currentDay)) {
        return;
      }

      // Check if it's the scheduled time
      if (currentTime !== settings.autoSyncScheduleTime) {
        return;
      }

      // Check if we already synced today at this time
      if (lastScheduledSyncDateRef.current === currentDate) {
        console.log("[AutoSync] Already synced today at scheduled time");
        return;
      }

      console.log("[AutoSync] Running scheduled sync...");
      lastScheduledSyncDateRef.current = currentDate;

      try {
        // Check if there are changes to sync
        const status = await getStatus(repoPath);
        if (!status.hasChanges) {
          console.log("[AutoSync] No changes to sync");
          return;
        }

        // Get git config for commit author
        const config = await getConfig(repoPath);

        // Auto-generate commit message
        const allChangedFiles = [
          ...(status.files?.added || []),
          ...(status.files?.modified || []),
          ...(status.files?.deleted || []),
        ];

        const noteTitles = allChangedFiles
          .filter((file) => file.endsWith(".md"))
          .map((file) => {
            const fileName = file.split("/").pop()?.replace(".md", "") || "";
            return fileName
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          })
          .filter(Boolean);

        const commitMessage =
          noteTitles.length > 0
            ? `Scheduled sync: ${noteTitles.length} note${noteTitles.length > 1 ? "s" : ""} updated`
            : "Scheduled sync: Updates";

        // Commit
        console.log("[AutoSync] Committing changes...");
        await commit(repoPath, {
          message: commitMessage,
          author: {
            name: config.name,
            email: config.email,
          },
          passphrase: passphrase,
        });

        // Push
        console.log("[AutoSync] Pushing to remote...");
        await push(repoPath, "origin");

        console.log("[AutoSync] Scheduled sync completed successfully");
      } catch (error: any) {
        console.error("[AutoSync] Scheduled sync failed:", error.message);
      }
    };

    // Check every minute if it's time to run scheduled sync
    scheduleTimerRef.current = setInterval(checkScheduledSync, 60000);

    // Run check immediately
    checkScheduledSync();

    // Cleanup
    return () => {
      if (scheduleTimerRef.current) {
        clearInterval(scheduleTimerRef.current);
        scheduleTimerRef.current = null;
      }
    };
  }, [
    settings.autoSyncScheduleEnabled,
    settings.autoSyncScheduleTime,
    settings.autoSyncScheduleDays,
    repoPath,
    passphrase,
    isUnlocked,
  ]);

  // This component doesn't render anything
  return null;
}
