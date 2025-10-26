"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { SecureString } from "@/lib/security/SecureString";

interface RepoContextType {
  repoPath: string | null;
  isUnlocked: boolean;
  isLoading: boolean;
  passphrase: string | null; // DEPRECATED: Use getDEK() instead
  getPassphrase: () => string | null; // DEPRECATED: Use getDEK() instead
  getDEK: () => string | null; // NEW: Get Data Encryption Key
  setRepo: (path: string, dekBase64: string) => void;
  setRepoPath: (path: string) => void;
  lock: () => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [repoPath, setRepoPathState] = useState<string | null>(null);
  // Store DEK as SecureString to prevent logging
  const [secureDEK, setSecureDEK] = useState<SecureString | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load repo path and DEK from localStorage on mount
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      const savedPath = localStorage.getItem("holocron-repo-path");
      const savedDEK = localStorage.getItem("holocron-dek");

      if (!savedPath) {
        // No saved path - user needs to go through setup
        setIsLoading(false);
        return;
      }

      setRepoPathState(savedPath);

      // If we have a saved DEK, auto-unlock
      if (savedDEK) {
        // Store DEK securely in memory
        setSecureDEK(SecureString.create(savedDEK, 'dek'));
        setIsUnlocked(true);
      }

      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const setRepoPath = useCallback((path: string) => {
    setRepoPathState(path);
    localStorage.setItem("holocron-repo-path", path);
  }, []);

  const lock = useCallback(() => {
    // Clear secure DEK
    if (secureDEK) {
      secureDEK.clear();
    }
    setSecureDEK(null);
    setIsUnlocked(false);

    // Clear DEK from localStorage
    localStorage.removeItem("holocron-dek");
  }, [secureDEK]);

  const setRepo = useCallback((path: string, dekBase64: string) => {
    // Store DEK securely in memory
    setSecureDEK(SecureString.create(dekBase64, 'dek'));
    setIsUnlocked(true);
    setRepoPath(path);

    // Save DEK to localStorage for auto-unlock
    // This is acceptable for a local-only app
    localStorage.setItem("holocron-dek", dekBase64);
  }, [setRepoPath]);

  // Secure accessor for DEK (NEW - replaces getPassphrase)
  const getDEK = useCallback((): string | null => {
    return secureDEK?.reveal() ?? null;
  }, [secureDEK]);

  // DEPRECATED: Kept for backward compatibility during migration
  const getPassphrase = useCallback((): string | null => {
    console.warn('[RepoContext] getPassphrase() is deprecated - use getDEK() instead');
    return getDEK();
  }, [getDEK]);

  return (
    <RepoContext.Provider
      value={{
        repoPath,
        isUnlocked,
        isLoading,
        // DEPRECATED: Maintained for backward compatibility - use getDEK() instead
        passphrase: secureDEK?.reveal() ?? null,
        getPassphrase, // DEPRECATED
        getDEK, // NEW
        setRepo,
        setRepoPath,
        lock,
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
