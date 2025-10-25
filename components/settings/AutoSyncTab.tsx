import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

interface Settings {
  showCodeBlockLanguageSelector: boolean;
  theme: "light" | "dark" | "system";
  accentColor: string;
  uiFont: string;
  editorFont: string;
  editorTheme: "github-light" | "github-dark" | "monokai" | "dracula" | "nord";
  density: "compact" | "comfortable" | "spacious";
  fontSizeGlobal: number;
  fontSizeEditor: number;
  autoSyncEnabled: boolean;
  autoSyncInterval: number;
  autoSyncScheduleEnabled: boolean;
  autoSyncScheduleTime: string;
  autoSyncScheduleDays: number[];
}

interface AutoSyncTabProps {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const AutoSyncTab = React.memo(function AutoSyncTab({
  settings,
  updateSettings,
}: AutoSyncTabProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Auto-Sync
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync-enabled">
              Enable Automatic Sync
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically commit and push changes on a schedule when the app is open
            </p>
          </div>
          <Switch
            id="auto-sync-enabled"
            checked={settings.autoSyncEnabled}
            onCheckedChange={(checked) =>
              updateSettings({ autoSyncEnabled: checked })
            }
          />
        </div>

        {settings.autoSyncEnabled && (
          <div className="space-y-2">
            <Label htmlFor="auto-sync-interval">Sync Interval</Label>
            <Select
              value={settings.autoSyncInterval.toString()}
              onValueChange={(value) =>
                updateSettings({ autoSyncInterval: parseInt(value) })
              }
            >
              <SelectTrigger id="auto-sync-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="10">Every 10 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
                <SelectItem value="120">Every 2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often to automatically sync your changes
            </p>
          </div>
        )}

        {/* Scheduled Sync */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync-schedule-enabled">
                Schedule Daily Sync
              </Label>
              <p className="text-xs text-muted-foreground">
                Sync at a specific time each day
              </p>
            </div>
            <Switch
              id="auto-sync-schedule-enabled"
              checked={settings.autoSyncScheduleEnabled}
              onCheckedChange={(checked) =>
                updateSettings({ autoSyncScheduleEnabled: checked })
              }
            />
          </div>

          {settings.autoSyncScheduleEnabled && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="auto-sync-schedule-time">Sync Time</Label>
                <Input
                  id="auto-sync-schedule-time"
                  type="time"
                  value={settings.autoSyncScheduleTime}
                  onChange={(e) =>
                    updateSettings({ autoSyncScheduleTime: e.target.value })
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Time of day to run scheduled sync (24-hour format)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Sun", value: 0 },
                    { label: "Mon", value: 1 },
                    { label: "Tue", value: 2 },
                    { label: "Wed", value: 3 },
                    { label: "Thu", value: 4 },
                    { label: "Fri", value: 5 },
                    { label: "Sat", value: 6 },
                  ].map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={
                        settings.autoSyncScheduleDays.includes(day.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="w-14"
                      onClick={() => {
                        const days = settings.autoSyncScheduleDays.includes(day.value)
                          ? settings.autoSyncScheduleDays.filter((d) => d !== day.value)
                          : [...settings.autoSyncScheduleDays, day.value].sort();
                        updateSettings({ autoSyncScheduleDays: days });
                      }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which days to run the scheduled sync
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
