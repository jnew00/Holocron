import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PassphraseStepProps {
  passphrase: string;
  setPassphrase: (value: string) => void;
  confirmPassphrase: string;
  setConfirmPassphrase: (value: string) => void;
  onCreateRepo: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string;
}

export const PassphraseStep = memo(function PassphraseStep({
  passphrase,
  setPassphrase,
  confirmPassphrase,
  setConfirmPassphrase,
  onCreateRepo,
  onBack,
  loading,
  error,
}: PassphraseStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Passphrase</CardTitle>
        <CardDescription>
          Secure your notes with a strong passphrase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="passphrase">Passphrase</Label>
          <Input
            id="passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter a strong passphrase"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
          <Input
            id="confirm-passphrase"
            type="password"
            value={confirmPassphrase}
            onChange={(e) => setConfirmPassphrase(e.target.value)}
            placeholder="Confirm your passphrase"
            autoComplete="new-password"
          />
        </div>
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 rounded-lg text-sm">
          <strong>Important:</strong> There is no way to recover your passphrase if
          you forget it. Please store it securely.
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={onCreateRepo}
          disabled={loading || !passphrase || !confirmPassphrase}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Repository"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});
