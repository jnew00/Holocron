"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { SecureString } from "@/lib/security/SecureString";

interface RepoContextType {
  repoPath: string | null;
  isUnlocked: boolean;
  passphrase: string | null; // DEPRECATED: Use getPassphrase() instead
  getPassphrase: () => string | null; // Secure accessor
  setRepo: (path: string, passphrase: string) => void;
  setRepoPath: (path: string) => void;
  lock: () => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [repoPath, setRepoPathState] = useState<string | null>(null);
  // Store passphrase as SecureString to prevent logging
  const [securePassphrase, setSecurePassphrase] = useState<SecureString | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Load repo path and passphrase from config on mount
  useEffect(() => {
    const loadConfig = async () => {
      const savedPath = localStorage.getItem("localnote-repo-path");

      if (!savedPath) {
        // No saved path - user needs to go through setup
        return;
      }

      setRepoPathState(savedPath);

      try {
        // Try to load encrypted config
        const response = await fetch(`/api/config/read?repoPath=${encodeURIComponent(savedPath)}`);

        if (response.ok) {
          const { config } = await response.json();

          // Auto-unlock with stored passphrase
          if (config.passphrase) {
            // Store as SecureString to prevent logging
            setSecurePassphrase(SecureString.create(config.passphrase, 'passphrase'));
            setIsUnlocked(true);
          }
        }
      } catch (error) {
        // If config fails to load, user will need to unlock manually
        // Don't log the error details to avoid leaking information
      }
    };

    loadConfig();
  }, []);

  const setRepoPath = useCallback((path: string) => {
    setRepoPathState(path);
    localStorage.setItem("localnote-repo-path", path);
  }, []);

  const lock = useCallback(() => {
    // Clear secure passphrase
    if (securePassphrase) {
      securePassphrase.clear();
    }
    setSecurePassphrase(null);
    setIsUnlocked(false);
  }, [securePassphrase]);

  const setRepo = useCallback((path: string, pass: string) => {
    // Store passphrase securely
    setSecurePassphrase(SecureString.create(pass, 'passphrase'));
    setIsUnlocked(true);
    setRepoPath(path);
  }, [setRepoPath]);

  // Secure accessor for passphrase
  const getPassphrase = useCallback((): string | null => {
    return securePassphrase?.reveal() ?? null;
  }, [securePassphrase]);

  return (
    <RepoContext.Provider
      value={{
        repoPath,
        isUnlocked,
        // DEPRECATED: Maintained for backward compatibility - use getPassphrase() instead
        passphrase: securePassphrase?.reveal() ?? null,
        getPassphrase,
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
