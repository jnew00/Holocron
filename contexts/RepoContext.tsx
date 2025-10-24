"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { LockManager } from "@/lib/security/lockManager";

interface RepoContextType {
  dirHandle: FileSystemDirectoryHandle | null;
  isUnlocked: boolean;
  passphrase: string | null;
  setRepo: (handle: FileSystemDirectoryHandle, passphrase: string) => void;
  lock: () => void;
  lockManager: LockManager | null;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const lockManagerRef = useRef<LockManager | null>(null);

  const lock = useCallback(() => {
    setPassphrase(null);
    setIsUnlocked(false);
    if (lockManagerRef.current) {
      lockManagerRef.current.stop();
    }
  }, []);

  const setRepo = useCallback((handle: FileSystemDirectoryHandle, pass: string) => {
    setDirHandle(handle);
    setPassphrase(pass);
    setIsUnlocked(true);

    // Initialize lock manager when repo is unlocked
    if (!lockManagerRef.current) {
      lockManagerRef.current = new LockManager({
        autoLockTimeout: 15 * 60 * 1000, // 15 minutes
        lockOnIdle: true,
        warnBeforeLock: true,
        warnTimeMs: 60000, // 1 minute warning
      });
    }

    // Start monitoring for auto-lock
    lockManagerRef.current.start(
      () => {
        // Warning callback - could show a toast/dialog
        console.log("Warning: Auto-lock in 1 minute");
      },
      () => {
        // Lock callback
        lock();
      }
    );
  }, [lock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lockManagerRef.current) {
        lockManagerRef.current.stop();
      }
    };
  }, []);

  return (
    <RepoContext.Provider
      value={{
        dirHandle,
        isUnlocked,
        passphrase,
        setRepo,
        lock,
        lockManager: lockManagerRef.current,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  const context = useContext(RepoContext);
  if (context === undefined) {
    throw new Error("useRepo must be used within a RepoProvider");
  }
  return context;
}
