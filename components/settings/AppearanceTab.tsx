import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette } from "lucide-react";

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

interface AppearanceTabProps {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const AppearanceTab = React.memo(function AppearanceTab({
  settings,
  updateSettings,
}: AppearanceTabProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Appearance
      </h3>
      <div className="space-y-4">
        {/* Theme Mode */}
        <div className="space-y-2">
          <Label htmlFor="theme-mode">Theme Mode</Label>
          <Select
            value={settings.theme}
            onValueChange={(value: "light" | "dark" | "system") =>
              updateSettings({ theme: value })
            }
          >
            <SelectTrigger id="theme-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose your preferred color scheme
          </p>
        </div>

        {/* Accent Color */}
        <div className="space-y-2">
          <Label htmlFor="accent-color">Accent Color</Label>
          <Select
            value={settings.accentColor}
            onValueChange={(value) => updateSettings({ accentColor: value })}
          >
            <SelectTrigger id="accent-color">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="pink">Pink</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Primary color for buttons and highlights
          </p>
        </div>

        {/* Density */}
        <div className="space-y-2">
          <Label htmlFor="density">Spacing</Label>
          <Select
            value={settings.density}
            onValueChange={(value: "compact" | "comfortable" | "spacious") =>
              updateSettings({ density: value })
            }
          >
            <SelectTrigger id="density">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Control the spacing and padding throughout the UI
          </p>
        </div>

        {/* UI Font */}
        <div className="space-y-2">
          <Label htmlFor="ui-font">UI Font</Label>
          <Select
            value={settings.uiFont}
            onValueChange={(value) => updateSettings({ uiFont: value })}
          >
            <SelectTrigger id="ui-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system-ui">System UI</SelectItem>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="open-sans">Open Sans</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Font used for menus, buttons, and UI elements
          </p>
        </div>

        {/* Editor Font */}
        <div className="space-y-2">
          <Label htmlFor="editor-font">Editor Font</Label>
          <Select
            value={settings.editorFont}
            onValueChange={(value) => updateSettings({ editorFont: value })}
          >
            <SelectTrigger id="editor-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mono">System Mono</SelectItem>
              <SelectItem value="fira-code">Fira Code</SelectItem>
              <SelectItem value="jetbrains-mono">JetBrains Mono</SelectItem>
              <SelectItem value="source-code-pro">Source Code Pro</SelectItem>
              <SelectItem value="cascadia-code">Cascadia Code</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Monospace font for the note editor
          </p>
        </div>

        {/* Editor Theme */}
        <div className="space-y-2">
          <Label htmlFor="editor-theme">Editor Code Theme</Label>
          <Select
            value={settings.editorTheme}
            onValueChange={(value: any) => updateSettings({ editorTheme: value })}
          >
            <SelectTrigger id="editor-theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="github-light">GitHub Light</SelectItem>
              <SelectItem value="github-dark">GitHub Dark</SelectItem>
              <SelectItem value="monokai">Monokai</SelectItem>
              <SelectItem value="dracula">Dracula</SelectItem>
              <SelectItem value="nord">Nord</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Syntax highlighting theme for code blocks
          </p>
        </div>

        {/* Global Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size-global">Global Font Size</Label>
            <span className="text-sm text-muted-foreground">{settings.fontSizeGlobal}%</span>
          </div>
          <Slider
            id="font-size-global"
            min={50}
            max={200}
            step={5}
            value={[settings.fontSizeGlobal]}
            onValueChange={([value]) => updateSettings({ fontSizeGlobal: value })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Adjust font size for all UI elements (sidebar, buttons, menus)
          </p>
        </div>

        {/* Editor Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size-editor">Editor Font Size</Label>
            <span className="text-sm text-muted-foreground">{settings.fontSizeEditor}%</span>
          </div>
          <Slider
            id="font-size-editor"
            min={50}
            max={200}
            step={5}
            value={[settings.fontSizeEditor]}
            onValueChange={([value]) => updateSettings({ fontSizeEditor: value })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Adjust font size specifically for the note editor content
          </p>
        </div>
      </div>
    </div>
  );
});
