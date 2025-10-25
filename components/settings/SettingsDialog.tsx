"use client";

import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useRepo } from "@/contexts/RepoContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon, FolderGit2, Check, Palette, Type, Monitor, Clock } from "lucide-react";

export function SettingsDialog() {
  const { settings, updateSettings } = useSettings();
  const { repoPath, setRepoPath, passphrase } = useRepo();
  const [repoPathInput, setRepoPathInput] = useState(repoPath || "");
  const [passphraseInput, setPassphraseInput] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passphraseSaved, setPassphraseSaved] = useState(false);

  const handleSaveRepoPath = () => {
    if (repoPathInput.trim()) {
      setRepoPath(repoPathInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSavePassphrase = async () => {
    if (!repoPath || !passphraseInput.trim() || passphraseInput.length < 8) {
      return;
    }

    try {
      const response = await fetch("/api/config/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          config: {
            version: "1.0",
            passphrase: passphraseInput.trim(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        setPassphraseSaved(true);
        setTimeout(() => setPassphraseSaved(false), 2000);
        window.location.reload(); // Reload to pick up new passphrase
      }
    } catch (error) {
      console.error("Failed to save passphrase:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Settings">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your LocalNote preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          {/* Appearance Settings */}
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

          {/* Passphrase Settings */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Encryption Passphrase</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-passphrase">
                  Current Passphrase
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="current-passphrase"
                    type={showPassphrase ? "text" : "password"}
                    value={passphrase || ""}
                    readOnly
                    className="font-mono text-xs bg-muted"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                  >
                    {showPassphrase ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This passphrase is used to encrypt your notes before committing to Git.
                  It's stored encrypted on your machine using a machine-specific key.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-passphrase">
                  Change Passphrase (optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="new-passphrase"
                    type="password"
                    value={passphraseInput}
                    onChange={(e) => setPassphraseInput(e.target.value)}
                    placeholder="Enter new passphrase (min 8 characters)"
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={handleSavePassphrase}
                    variant={passphraseSaved ? "outline" : "default"}
                    disabled={!passphraseInput || passphraseInput.length < 8}
                  >
                    {passphraseSaved ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Git Settings */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4" />
              Git Repository Path (Optional)
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="repo-path">
                  Full path to your notes directory
                </Label>
                <p className="text-xs text-muted-foreground">
                  <strong>Only needed if you want to use Git sync.</strong> This is the full file system path
                  where your encrypted notes are stored (the same folder you selected during setup).
                </p>
                <div className="flex gap-2">
                  <Input
                    id="repo-path"
                    value={repoPathInput}
                    onChange={(e) => setRepoPathInput(e.target.value)}
                    placeholder="/Users/YourName/Documents/MyNotes"
                    className="font-mono text-xs"
                  />
                  <Button onClick={handleSaveRepoPath} variant={saved ? "outline" : "default"}>
                    {saved ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                {repoPath && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Current: {repoPath}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Auto-Sync Settings */}
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
            </div>
          </div>

          {/* Editor Settings */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
