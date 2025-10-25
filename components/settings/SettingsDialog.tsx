"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import { useSettingsOperations } from "@/hooks/useSettingsOperations";
import { AppearanceTab } from "./AppearanceTab";
import { EncryptionTab } from "./EncryptionTab";
import { GitSettingsTab } from "./GitSettingsTab";
import { AutoSyncTab } from "./AutoSyncTab";
import { EditorSettingsTab } from "./EditorSettingsTab";

export function SettingsDialog() {
  const {
    settings,
    updateSettings,
    repoPath,
    passphrase,
    repoPathInput,
    setRepoPathInput,
    passphraseInput,
    setPassphraseInput,
    showPassphrase,
    setShowPassphrase,
    saved,
    passphraseSaved,
    handleSaveRepoPath,
    handleSavePassphrase,
  } = useSettingsOperations();

  const [activeTab, setActiveTab] = useState("appearance");

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="git">Git</TabsTrigger>
            <TabsTrigger value="sync">Auto-Sync</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="appearance" className="mt-0 space-y-6">
              <AppearanceTab
                settings={settings}
                updateSettings={updateSettings}
              />
            </TabsContent>

            <TabsContent value="encryption" className="mt-0 space-y-6">
              <EncryptionTab
                passphrase={passphrase}
                showPassphrase={showPassphrase}
                setShowPassphrase={setShowPassphrase}
                passphraseInput={passphraseInput}
                setPassphraseInput={setPassphraseInput}
                passphraseSaved={passphraseSaved}
                handleSavePassphrase={handleSavePassphrase}
              />
            </TabsContent>

            <TabsContent value="git" className="mt-0 space-y-6">
              <GitSettingsTab
                repoPath={repoPath}
                repoPathInput={repoPathInput}
                setRepoPathInput={setRepoPathInput}
                saved={saved}
                handleSaveRepoPath={handleSaveRepoPath}
              />
            </TabsContent>

            <TabsContent value="sync" className="mt-0 space-y-6">
              <AutoSyncTab
                settings={settings}
                updateSettings={updateSettings}
              />
            </TabsContent>

            <TabsContent value="editor" className="mt-0 space-y-6">
              <EditorSettingsTab
                settings={settings}
                updateSettings={updateSettings}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
