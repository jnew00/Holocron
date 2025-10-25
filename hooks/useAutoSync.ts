import { useEffect, useRef } from "react";
import { performAutoSync } from "@/lib/git/performAutoSync";

interface UseAutoSyncOptions {
  enabled: boolean;
  interval: number;
  repoPath: string | null;
  passphrase: string | null;
  isUnlocked: boolean;
}

/**
 * Hook for interval-based auto-sync
 * Automatically commits and pushes changes at regular intervals
 */
export function useAutoSync({
  enabled,
  interval,
  repoPath,
  passphrase,
  isUnlocked,
}: UseAutoSyncOptions) {
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncAttemptRef = useRef<Date | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    // Only set up auto-sync if enabled and repo is configured
    if (!enabled || !repoPath || !passphrase || !isUnlocked) {
      return;
    }

    console.log(`[AutoSync] Setting up auto-sync every ${interval} minutes`);

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
        await performAutoSync({
          repoPath: repoPath!,
          passphrase: passphrase!,
          messagePrefix: "Auto-sync",
        });
      } catch (error: any) {
        console.error("[AutoSync] Sync failed:", error.message);
        // Don't throw - we'll try again on next interval
      }
    };

    // Run sync immediately if there are pending changes (after a short delay)
    const initialTimeout = setTimeout(performSync, 10000); // 10 seconds after app starts

    // Set up recurring sync
    const intervalMs = interval * 60 * 1000;
    syncTimerRef.current = setInterval(performSync, intervalMs);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [enabled, interval, repoPath, passphrase, isUnlocked]);
}
