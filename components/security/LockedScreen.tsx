"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
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
import { Lock, Loader2 } from "lucide-react";

export function LockedScreen() {
  const { repoPath, setRepo } = useRepo();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!repoPath) {
      setError("No repository found");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // For now, just validate passphrase length
      // Real validation will happen when trying to decrypt files
      if (!passphrase || passphrase.length < 8) {
        setError("Invalid passphrase");
        setLoading(false);
        return;
      }

      setRepo(repoPath, passphrase);
    } catch (err) {
      setError("Failed to unlock: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Repository Locked</CardTitle>
          <CardDescription>
            Your notes are encrypted and secure. Enter your passphrase to unlock.
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
              onKeyDown={handleKeyDown}
              placeholder="Enter your passphrase"
              autoComplete="current-password"
              autoFocus
            />
          </div>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Your session was locked due to inactivity or manual lock.
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUnlock}
            disabled={loading || !passphrase}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Unlock Repository
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
