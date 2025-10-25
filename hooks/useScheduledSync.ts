import { useEffect, useRef } from "react";
import { performAutoSync } from "@/lib/git/performAutoSync";

interface UseScheduledSyncOptions {
  enabled: boolean;
  scheduleTime: string;
  scheduleDays: number[];
  repoPath: string | null;
  passphrase: string | null;
  isUnlocked: boolean;
}

/**
 * Hook for time-based scheduled sync
 * Automatically commits and pushes changes at a specific time on selected days
 */
export function useScheduledSync({
  enabled,
  scheduleTime,
  scheduleDays,
  repoPath,
  passphrase,
  isUnlocked,
}: UseScheduledSyncOptions) {
  const scheduleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScheduledSyncDateRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear any existing schedule timer
    if (scheduleTimerRef.current) {
      clearInterval(scheduleTimerRef.current);
      scheduleTimerRef.current = null;
    }

    // Only set up scheduled sync if enabled and repo is configured
    if (
      !enabled ||
      !repoPath ||
      !passphrase ||
      !isUnlocked ||
      scheduleDays.length === 0
    ) {
      return;
    }

    console.log(
      `[AutoSync] Setting up scheduled sync at ${scheduleTime} on days: ${scheduleDays.join(", ")}`
    );

    const checkScheduledSync = async () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const currentDate = now.toDateString();

      // Check if today is in the selected days
      if (!scheduleDays.includes(currentDay)) {
        return;
      }

      // Check if it's the scheduled time
      if (currentTime !== scheduleTime) {
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
        await performAutoSync({
          repoPath: repoPath!,
          passphrase: passphrase!,
          messagePrefix: "Scheduled sync",
        });
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
  }, [enabled, scheduleTime, scheduleDays, repoPath, passphrase, isUnlocked]);
}
