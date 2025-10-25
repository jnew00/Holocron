/**
 * Custom hook for unlocking the repository
 * Handles passphrase validation and unlock logic
 */

import { useState, useCallback } from "react";

interface UseUnlockProps {
  repoPath: string | null;
  setRepo: (path: string, passphrase: string) => void;
}

interface UseUnlockReturn {
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  error: string;
  loading: boolean;
  handleUnlock: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export function useUnlock({ repoPath, setRepo }: UseUnlockProps): UseUnlockReturn {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = useCallback(async () => {
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
  }, [repoPath, passphrase, setRepo]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  }, [handleUnlock]);

  return {
    passphrase,
    setPassphrase,
    error,
    loading,
    handleUnlock,
    handleKeyDown,
  };
}
