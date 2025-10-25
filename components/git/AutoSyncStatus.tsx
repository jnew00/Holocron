import React from "react";
import { Clock } from "lucide-react";

interface AutoSyncStatusProps {
  settings: {
    autoSyncEnabled: boolean;
    autoSyncInterval: number;
    autoSyncScheduleEnabled: boolean;
    autoSyncScheduleTime: string;
    autoSyncScheduleDays: number[];
  };
  nextSyncTime: string;
}

export const AutoSyncStatus = React.memo(function AutoSyncStatus({
  settings,
  nextSyncTime
}: AutoSyncStatusProps) {
  if (!settings.autoSyncEnabled && !settings.autoSyncScheduleEnabled) {
    return null;
  }

  return (
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
          {nextSyncTime && (
            <p className="font-medium text-blue-800 dark:text-blue-300 mt-1">
              Next sync: {nextSyncTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
