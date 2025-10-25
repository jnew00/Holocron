import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface EncryptionTabProps {
  passphrase: string | null;
  showPassphrase: boolean;
  setShowPassphrase: (show: boolean) => void;
  passphraseInput: string;
  setPassphraseInput: (value: string) => void;
  passphraseSaved: boolean;
  handleSavePassphrase: () => void;
}

export const EncryptionTab = React.memo(function EncryptionTab({
  passphrase,
  showPassphrase,
  setShowPassphrase,
  passphraseInput,
  setPassphraseInput,
  passphraseSaved,
  handleSavePassphrase,
}: EncryptionTabProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Encryption Passphrase</h3>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="current-passphrase">
            Current Passphrase
          </Label>
          <div className="flex gap-2">
            <Input
              id="current-passphrase"
              type={showPassphrase ? "text" : "password"}
              value={passphrase || ""}
              readOnly
              className="font-mono text-xs bg-muted"
            />
            <Button
              variant="outline"
              onClick={() => setShowPassphrase(!showPassphrase)}
            >
              {showPassphrase ? "Hide" : "Show"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This passphrase is used to encrypt your notes before committing to Git.
            It's stored encrypted on your machine using a machine-specific key.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-passphrase">
            Change Passphrase (optional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-passphrase"
              type="password"
              value={passphraseInput}
              onChange={(e) => setPassphraseInput(e.target.value)}
              placeholder="Enter new passphrase (min 8 characters)"
              className="font-mono text-xs"
            />
            <Button
              onClick={handleSavePassphrase}
              variant={passphraseSaved ? "outline" : "default"}
              disabled={!passphraseInput || passphraseInput.length < 8}
            >
              {passphraseSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
