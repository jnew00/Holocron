"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface RepoContextType {
  dirHandle: FileSystemDirectoryHandle | null;
  isUnlocked: boolean;
  passphrase: string | null;
  setRepo: (handle: FileSystemDirectoryHandle, passphrase: string) => void;
  lock: () => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const setRepo = useCallback((handle: FileSystemDirectoryHandle, pass: string) => {
    setDirHandle(handle);
    setPassphrase(pass);
    setIsUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    setPassphrase(null);
    setIsUnlocked(false);
  }, []);

  return (
    <RepoContext.Provider value={{ dirHandle, isUnlocked, passphrase, setRepo, lock }}>
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
