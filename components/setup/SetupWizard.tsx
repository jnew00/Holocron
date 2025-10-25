"use client";

import { useWizardSetup } from "@/hooks/useWizardSetup";
import { DirectoryStep } from "./DirectoryStep";
import { PassphraseStep } from "./PassphraseStep";
import { UnlockStep } from "./UnlockStep";
import { CompleteStep } from "./CompleteStep";

export function SetupWizard() {
  const {
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
  } = useWizardSetup();

  if (step === "select-directory") {
    return (
      <DirectoryStep
        onSelectDirectory={handleSelectDirectory}
        loading={loading}
        error={error}
      />
    );
  }

  if (step === "create-passphrase") {
    return (
      <PassphraseStep
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        confirmPassphrase={confirmPassphrase}
        setConfirmPassphrase={setConfirmPassphrase}
        onCreateRepo={handleCreateRepo}
        onBack={handleBackToDirectory}
        loading={loading}
        error={error}
      />
    );
  }

  if (step === "unlock") {
    return (
      <UnlockStep
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        onUnlock={handleUnlock}
        onBack={handleBackToDirectory}
        loading={loading}
        error={error}
      />
    );
  }

  if (step === "complete") {
    return <CompleteStep isExistingRepo={isExistingRepo} />;
  }

  return null;
}
