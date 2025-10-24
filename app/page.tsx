"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { LockedScreen } from "@/components/security/LockedScreen";
import { LockButton } from "@/components/security/LockButton";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { NoteTemplate } from "@/lib/templates/templates";

export default function Home() {
  const { isUnlocked, dirHandle } = useRepo();
  const [markdown, setMarkdown] = useState("# Welcome to LocalNote\n\nStart typing your notes here...\n\n- [ ] Try the task list feature\n- [x] Explore the editor\n\n");
  const [currentNote, setCurrentNote] = useState<string>("Welcome");

  const handleTemplateSelect = (template: NoteTemplate) => {
    setMarkdown(template.content);
    setCurrentNote(template.name);
  };

  // Show setup wizard if no repo is selected
  if (!dirHandle) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <SetupWizard />
      </main>
    );
  }

  // Show locked screen if repo exists but is locked
  if (!isUnlocked) {
    return <LockedScreen />;
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">LocalNote</h1>
            <p className="text-muted-foreground">
              Your encrypted notes are ready
            </p>
          </div>
          <div className="flex gap-2">
            <LockButton />
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{currentNote}</h2>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>Auto-saved</span>
            </div>
          </div>
          <TiptapEditor
            content={markdown}
            onChange={setMarkdown}
            placeholder="Start writing your note..."
          />
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Markdown Output:</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {markdown}
          </pre>
        </div>
      </div>
    </main>
  );
}
