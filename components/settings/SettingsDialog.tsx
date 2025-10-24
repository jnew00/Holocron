"use client";

import { useSettings } from "@/contexts/SettingsContext";
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
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon } from "lucide-react";

export function SettingsDialog() {
  const { settings, updateSettings } = useSettings();

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
