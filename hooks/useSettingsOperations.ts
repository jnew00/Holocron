import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useRepo } from "@/contexts/RepoContext";
import { ConfigRepository, RepositoryError } from "@/lib/repositories";

export function useSettingsOperations() {
  const { settings, updateSettings } = useSettings();
  const { repoPath, setRepoPath, passphrase } = useRepo();
  const [repoPathInput, setRepoPathInput] = useState(repoPath || "");
  const [passphraseInput, setPassphraseInput] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passphraseSaved, setPassphraseSaved] = useState(false);

  const handleSaveRepoPath = () => {
    if (repoPathInput.trim()) {
      setRepoPath(repoPathInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSavePassphrase = async () => {
    if (!repoPath || !passphraseInput.trim() || passphraseInput.length < 8) {
      return;
    }

    try {
      const configRepo = new ConfigRepository(repoPath);
      await configRepo.write(
        {
          version: "1.0",
          passphrase: passphraseInput.trim(),
          updatedAt: new Date().toISOString(),
        },
        passphraseInput.trim()
      );

      setPassphraseSaved(true);
      setTimeout(() => setPassphraseSaved(false), 2000);
      window.location.reload(); // Reload to pick up new passphrase
    } catch (error) {
      if (error instanceof RepositoryError) {
        console.error("Failed to save passphrase:", error.message);
      } else {
        console.error("Failed to save passphrase:", error);
      }
    }
  };

  return {
    settings,
    updateSettings,
    repoPath,
    passphrase,
    repoPathInput,
    setRepoPathInput,
    passphraseInput,
    setPassphraseInput,
    showPassphrase,
    setShowPassphrase,
    saved,
    passphraseSaved,
    handleSaveRepoPath,
    handleSavePassphrase,
  };
}
