"use client";

import { useState } from "react";
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
import { Lock } from "lucide-react";

export function LockButton() {
  const { lock } = useRepo();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLockClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLock = () => {
    setShowConfirm(false);
    lock();
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
    </>
  );
}
