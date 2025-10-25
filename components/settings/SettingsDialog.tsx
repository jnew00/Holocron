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
import { Settings as SettingsIcon, FolderGit2, Check } from "lucide-react";

export function SettingsDialog() {
  const { settings, updateSettings } = useSettings();
  const { repoPath, setRepoPath } = useRepo();
  const [repoPathInput, setRepoPathInput] = useState(repoPath || "");
  const [saved, setSaved] = useState(false);

  const handleSaveRepoPath = () => {
    if (repoPathInput.trim()) {
      setRepoPath(repoPathInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Settings">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your LocalNote preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
