import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";

type WizardStep = "welcome" | "select-directory" | "create-passphrase" | "unlock" | "complete";

export function useWizardSetup() {
  const { setRepo, setRepoPath } = useRepo();
  const [step, setStep] = useState<WizardStep>("select-directory");
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExistingRepo, setIsExistingRepo] = useState(false);

  const handleSelectDirectory = async () => {
    setLoading(true);
    setError("");

    try {
      // Call server-side API to open native folder dialog
      const response = await fetch("/api/fs/select-directory");

      if (!response.ok) {
        const data = await response.json();
        if (data.cancelled) {
          setError("Folder selection cancelled");
          return;
        }
        throw new Error(data.error || "Failed to select directory");
      }

      const data = await response.json();
      const path = data.path;
      setDirectoryPath(path);

      // Store the path for Git operations
      setRepoPath(path);

      // Check if it's an existing repo by checking for .localnote folder
      const checkResponse = await fetch(`/api/fs/check-repo?path=${encodeURIComponent(path)}`);
      const checkData = await checkResponse.json();
      setIsExistingRepo(checkData.isValid);

      if (checkData.isValid) {
        // Check if config exists (without trying to decrypt yet)
        const configResponse = await fetch(`/api/config/read?repoPath=${encodeURIComponent(path)}`);
        if (configResponse.ok) {
          const { exists } = await configResponse.json();
          if (exists) {
            // Config exists, need to unlock with passphrase
            setStep("unlock");
          } else {
            // Config doesn't have expected structure, create new
            console.log("[SetupWizard] Config exists but invalid structure, creating new");
            setStep("create-passphrase");
          }
        } else {
          // Config doesn't exist, create new
          setStep("create-passphrase");
        }
      } else {
        setStep("create-passphrase");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!directoryPath) return;

    setError("");

    // Validate passphrase
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters long");
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match");
      return;
    }

    setLoading(true);

    try {
      // Initialize repo via API
      const initResponse = await fetch("/api/fs/init-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: directoryPath }),
      });

      if (!initResponse.ok) {
        const data = await initResponse.json();
        throw new Error(data.error || "Failed to initialize repository");
      }

      // Save encrypted config with passphrase
      const configResponse = await fetch("/api/config/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath: directoryPath,
          passphrase: passphrase, // Used to encrypt the config
          config: {
            version: "1.0",
            passphrase: passphrase, // Stored in the encrypted config
            createdAt: new Date().toISOString(),
          },
        }),
      });

      if (!configResponse.ok) {
        const data = await configResponse.json();
        throw new Error(data.error || "Failed to save config");
      }

      setRepo(directoryPath, passphrase);
      setStep("complete");
    } catch (err) {
      setError("Failed to initialize repository: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!directoryPath) return;

    setError("");
    setLoading(true);

    try {
      // Try to decrypt config with the provided passphrase
      const configResponse = await fetch(
        `/api/config/read?repoPath=${encodeURIComponent(directoryPath)}&passphrase=${encodeURIComponent(passphrase)}`
      );

      if (!configResponse.ok) {
        const data = await configResponse.json();
        if (data.invalidPassphrase) {
          setError("Invalid passphrase");
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to read config");
      }

      const { config } = await configResponse.json();

      // Verify the config structure is valid
      if (!config || !config.passphrase) {
        setError("Invalid config structure");
        setLoading(false);
        return;
      }

      // Successfully decrypted - unlock the repo
      setRepo(directoryPath, passphrase);
      setStep("complete");
    } catch (err) {
      setError("Failed to unlock: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDirectory = () => {
    setStep("select-directory");
    setDirectoryPath(null);
    setPassphrase("");
  };

  return {
    step,
    directoryPath,
    passphrase,
    setPassphrase,
    confirmPassphrase,
    setConfirmPassphrase,
    error,
    loading,
    isExistingRepo,
    handleSelectDirectory,
    handleCreateRepo,
    handleUnlock,
    handleBackToDirectory,
  };
}
