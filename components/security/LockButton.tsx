"use client";

import { useState, useEffect } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lock, AlertTriangle } from "lucide-react";
import { formatTimeRemaining } from "@/lib/security/lockManager";

export function LockButton() {
  const { lock, lockManager } = useRepo();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!lockManager) return;

    // Check for auto-lock warning
    const warningInterval = setInterval(() => {
      const remaining = lockManager.getTimeUntilLock();
      setTimeRemaining(remaining);

      // Show warning when less than 1 minute remains
      if (remaining > 0 && remaining <= 60000 && !showWarning) {
        setShowWarning(true);
      }

      // Auto-close warning if time is up
      if (remaining === 0 && showWarning) {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(warningInterval);
  }, [lockManager, showWarning]);

  const handleLockClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLock = () => {
    setShowConfirm(false);
    lock();
  };

  const handleStayUnlocked = () => {
    setShowWarning(false);
    if (lockManager) {
      lockManager.resetTimer();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLockClick}
        title="Lock repository"
      >
        <Lock className="h-4 w-4 mr-2" />
        Lock
      </Button>

      {/* Manual lock confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock Repository?</AlertDialogTitle>
            <AlertDialogDescription>
              Your repository will be locked and you'll need to enter your passphrase
              to access it again. Any unsaved changes will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLock}>
              Lock Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-lock warning */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <AlertDialogTitle>Auto-Lock Warning</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Your session will automatically lock in{" "}
              <strong className="text-foreground">
                {formatTimeRemaining(timeRemaining)}
              </strong>{" "}
              due to inactivity. Any unsaved work will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleStayUnlocked}>
              Stay Unlocked
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
