"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Server-side repo operations via API
import { useRepo } from "@/contexts/RepoContext";
import { Loader2, FolderOpen, Lock, CheckCircle2 } from "lucide-react";

type WizardStep = "welcome" | "select-directory" | "create-passphrase" | "unlock" | "complete";

export function SetupWizard() {
  const { setRepo, setRepoPath } = useRepo();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExistingRepo, setIsExistingRepo] = useState(false);

  const handleSelectDirectory = async () => {
    setLoading(true);
    setError("");

    try {
      // Call server-side API to open native folder dialog
      const response = await fetch("/api/fs/select-directory");

      if (!response.ok) {
        const data = await response.json();
        if (data.cancelled) {
          setError("Folder selection cancelled");
          return;
        }
        throw new Error(data.error || "Failed to select directory");
      }

      const data = await response.json();
      const path = data.path;
      setDirectoryPath(path);

      // Store the path for Git operations
      setRepoPath(path);

      // Check if it's an existing repo by checking for .localnote folder
      const checkResponse = await fetch(`/api/fs/check-repo?path=${encodeURIComponent(path)}`);
      const checkData = await checkResponse.json();
      setIsExistingRepo(checkData.isValid);

      if (checkData.isValid) {
        setStep("unlock");
      } else {
        setStep("create-passphrase");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!directoryPath) return;

    setError("");

    // Validate passphrase
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters long");
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match");
      return;
    }

    setLoading(true);

    try {
      // Initialize repo via API
      const initResponse = await fetch("/api/fs/init-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: directoryPath }),
      });

      if (!initResponse.ok) {
        const data = await initResponse.json();
        throw new Error(data.error || "Failed to initialize repository");
      }

      // Save encrypted config with passphrase
      const configResponse = await fetch("/api/config/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath: directoryPath,
          config: {
            version: "1.0",
            passphrase: passphrase,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      if (!configResponse.ok) {
        const data = await configResponse.json();
        throw new Error(data.error || "Failed to save config");
      }

      setRepo(directoryPath, passphrase);
      setStep("complete");
    } catch (err) {
      setError("Failed to initialize repository: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!directoryPath) return;

    setError("");
    setLoading(true);

    try {
      // Validate passphrase by trying to read config
      const configResponse = await fetch(`/api/config/read?repoPath=${encodeURIComponent(directoryPath)}`);

      if (!configResponse.ok) {
        const data = await configResponse.json();
        throw new Error(data.error || "Failed to read config");
      }

      const { config } = await configResponse.json();

      // Verify entered passphrase matches stored passphrase
      if (passphrase !== config.passphrase) {
        setError("Invalid passphrase");
        setLoading(false);
        return;
      }

      setRepo(directoryPath, passphrase);
      setStep("complete");
    } catch (err) {
      setError("Failed to unlock: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "welcome") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome to LocalNote</CardTitle>
          <CardDescription>
            A personal, local-first encrypted note-taker with mini-kanban
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To get started, you'll need to select a folder where your encrypted notes
            will be stored. This folder will remain on your computer and never leave
            your device.
          </p>
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <Lock className="h-5 w-5 text-primary" />
            <div className="flex-1 text-sm">
              All your notes are encrypted with AES-256-GCM and only accessible with
              your passphrase.
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setStep("select-directory")} className="w-full">
            Get Started
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "select-directory") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select Repository Location</CardTitle>
          <CardDescription>
            Choose where to store your encrypted notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select an empty folder or an existing LocalNote repository. We'll create
            the necessary structure for you.
          </p>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setStep("welcome")}>
            Back
          </Button>
          <Button
            onClick={handleSelectDirectory}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <FolderOpen className="mr-2 h-4 w-4" />
                Select Folder
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "create-passphrase") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Passphrase</CardTitle>
          <CardDescription>
            Secure your notes with a strong passphrase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter a strong passphrase"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
            <Input
              id="confirm-passphrase"
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              placeholder="Confirm your passphrase"
              autoComplete="new-password"
            />
          </div>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 rounded-lg text-sm">
            <strong>Important:</strong> There is no way to recover your passphrase if
            you forget it. Please store it securely.
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setStep("select-directory");
              setDirectoryPath(null);
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleCreateRepo}
            disabled={loading || !passphrase || !confirmPassphrase}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Repository"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "unlock") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Unlock Repository</CardTitle>
          <CardDescription>
            Enter your passphrase to access your notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlock-passphrase">Passphrase</Label>
            <Input
              id="unlock-passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your passphrase"
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUnlock();
                }
              }}
            />
          </div>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setStep("select-directory");
              setDirectoryPath(null);
              setPassphrase("");
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={loading || !passphrase}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Unlock
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "complete") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            {isExistingRepo ? "Repository Unlocked" : "Repository Created"}
          </CardTitle>
          <CardDescription>
            {isExistingRepo
              ? "Your notes are now accessible"
              : "Your encrypted note repository is ready"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You can now start taking notes. All your data will be encrypted and stored
            locally in the folder you selected.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Continue to LocalNote
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}
