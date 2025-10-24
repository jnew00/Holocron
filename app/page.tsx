"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function Home() {
  const { isUnlocked } = useRepo();
  const [markdown, setMarkdown] = useState("# Welcome to LocalNote\n\nStart typing your notes here...\n\n- [ ] Try the task list feature\n- [x] Explore the editor\n\n");

  if (!isUnlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <SetupWizard />
      </main>
    );
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
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Editor Demo</h2>
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
