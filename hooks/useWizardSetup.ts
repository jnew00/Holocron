import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { generateDEK, wrapDEK, unwrapDEK, base64Encode, base64Decode } from "@/lib/crypto/unified";
import { createConfigWithDEK, isKeyWrappingConfig } from "@/lib/schema/config";

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

      // Check if it's an existing repo by checking for .holocron folder
      const checkResponse = await fetch(`/api/fs/check-repo?path=${encodeURIComponent(path)}`);
      const checkData = await checkResponse.json();
      setIsExistingRepo(checkData.isValid);

      if (checkData.isValid) {
        // Check if config exists (without trying to decrypt yet)
        const configResponse = await fetch("/api/config/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoPath: path }),
        });
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

      // NEW: Generate DEK and wrap it with user passphrase
      const dek = generateDEK();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const wrappedDEK = await wrapDEK(dek, passphrase, salt);

      // Create new config with DEK encryption metadata
      const config = createConfigWithDEK(
        base64Encode(salt),
        base64Encode(wrappedDEK),
        300000 // PBKDF2 iterations
      );

      // Save plaintext config (no encryption needed!)
      const configResponse = await fetch("/api/config/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath: directoryPath,
          config,
        }),
      });

      if (!configResponse.ok) {
        const data = await configResponse.json();
        throw new Error(data.error || "Failed to save config");
      }

      // Store DEK (not passphrase!) for auto-unlock
      localStorage.setItem("holocron-dek", base64Encode(dek));

      // Unlock with DEK
      setRepo(directoryPath, base64Encode(dek));
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
      // Read plaintext config
      const configResponse = await fetch("/api/config/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath: directoryPath }),
      });

      if (!configResponse.ok) {
        const data = await configResponse.json();
        throw new Error(data.error || "Failed to read config");
      }

      const { config, legacy } = await configResponse.json();

      // Check if legacy encrypted config
      if (legacy) {
        setError("Legacy config detected. Migration required - please contact support.");
        setLoading(false);
        return;
      }

      // Verify it's the new key wrapping config
      if (!config || !isKeyWrappingConfig(config)) {
        setError("Invalid config structure");
        setLoading(false);
        return;
      }

      // NEW: Unwrap DEK with user passphrase
      try {
        const salt = base64Decode(config.encryption.salt);
        const wrappedDEK = base64Decode(config.encryption.wrappedDEK);
        const dek = await unwrapDEK(wrappedDEK, passphrase, salt);

        // Store DEK (not passphrase!) for auto-unlock
        localStorage.setItem("holocron-dek", base64Encode(dek));

        // Unlock with DEK
        setRepo(directoryPath, base64Encode(dek));
        setStep("complete");
      } catch (unwrapError) {
        setError("Invalid passphrase");
        setLoading(false);
      }
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
