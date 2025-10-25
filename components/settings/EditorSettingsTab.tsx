import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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

interface EditorSettingsTabProps {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const EditorSettingsTab = React.memo(function EditorSettingsTab({
  settings,
  updateSettings,
}: EditorSettingsTabProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Editor</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-language-selector">
              Show Language Selector in Code Blocks
            </Label>
            <p className="text-xs text-muted-foreground">
              Display a dropdown to manually select the programming language.
              When disabled, syntax highlighting auto-detects the language.
            </p>
          </div>
          <Switch
            id="show-language-selector"
            checked={settings.showCodeBlockLanguageSelector}
            onCheckedChange={(checked) =>
              updateSettings({ showCodeBlockLanguageSelector: checked })
            }
          />
        </div>
      </div>
    </div>
  );
});
