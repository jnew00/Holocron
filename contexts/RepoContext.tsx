"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { SecureString } from "@/lib/security/SecureString";

interface RepoContextType {
  repoPath: string | null;
  isUnlocked: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Load repo path and passphrase from localStorage on mount
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      const savedPath = localStorage.getItem("holocron-repo-path");
      const savedPassphrase = localStorage.getItem("holocron-passphrase");

      if (!savedPath) {
        // No saved path - user needs to go through setup
        setIsLoading(false);
        return;
      }

      setRepoPathState(savedPath);

      // If we have a saved passphrase, try to use it to unlock
      if (savedPassphrase) {
        try {
          // Verify the passphrase works by trying to read the config
          const response = await fetch("/api/config/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repoPath: savedPath,
              passphrase: savedPassphrase
            }),
          });

          if (response.ok) {
            const { config } = await response.json();
            if (config?.passphrase) {
              // Auto-unlock with stored passphrase
              setSecurePassphrase(SecureString.create(savedPassphrase, 'passphrase'));
              setIsUnlocked(true);
            }
          }
        } catch (error) {
          // If config fails to load, user will need to unlock manually
          // Don't log the error details to avoid leaking information
        }
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
    // Clear secure passphrase
    if (securePassphrase) {
      securePassphrase.clear();
    }
    setSecurePassphrase(null);
    setIsUnlocked(false);

    // Clear passphrase from localStorage
    localStorage.removeItem("holocron-passphrase");
  }, [securePassphrase]);

  const setRepo = useCallback((path: string, pass: string) => {
    // Store passphrase securely in memory
    setSecurePassphrase(SecureString.create(pass, 'passphrase'));
    setIsUnlocked(true);
    setRepoPath(path);

    // Save passphrase to localStorage for auto-unlock
    // This is acceptable for a local-only app
    localStorage.setItem("holocron-passphrase", pass);
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
        isLoading,
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
