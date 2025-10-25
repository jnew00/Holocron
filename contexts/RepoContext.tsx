"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface RepoContextType {
  repoPath: string | null;
  isUnlocked: boolean;
  passphrase: string | null;
  setRepo: (path: string, passphrase: string) => void;
  setRepoPath: (path: string) => void;
  lock: () => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [repoPath, setRepoPathState] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Load repo path and passphrase from config on mount
  useEffect(() => {
    const loadConfig = async () => {
      const savedPath = localStorage.getItem("localnote-repo-path");
      if (!savedPath) return;

      setRepoPathState(savedPath);

      try {
        // Try to load encrypted config
        const response = await fetch(`/api/config/read?repoPath=${encodeURIComponent(savedPath)}`);

        if (response.ok) {
          const { config } = await response.json();

          // Auto-unlock with stored passphrase
          if (config.passphrase) {
            setPassphrase(config.passphrase);
            setIsUnlocked(true);
          }
        }
      } catch (error) {
        console.error("Failed to load config:", error);
        // If config fails to load, user will need to unlock manually
      }
    };

    loadConfig();
  }, []);

  const setRepoPath = useCallback((path: string) => {
    setRepoPathState(path);
    localStorage.setItem("localnote-repo-path", path);
  }, []);

  const lock = useCallback(() => {
    setPassphrase(null);
    setIsUnlocked(false);
  }, []);

  const setRepo = useCallback((path: string, pass: string) => {
    setPassphrase(pass);
    setIsUnlocked(true);
    setRepoPath(path);
    // Auto-lock removed - passphrase now persists in encrypted config
  }, [setRepoPath]);

  return (
    <RepoContext.Provider
      value={{
        repoPath,
        isUnlocked,
        passphrase,
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
