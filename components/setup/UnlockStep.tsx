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
import { Loader2, Lock } from "lucide-react";

interface UnlockStepProps {
  passphrase: string;
  setPassphrase: (value: string) => void;
  onUnlock: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string;
}

export const UnlockStep = memo(function UnlockStep({
  passphrase,
  setPassphrase,
  onUnlock,
  onBack,
  loading,
  error,
}: UnlockStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Unlock Repository</CardTitle>
        <CardDescription>
          Enter your passphrase to access your notes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unlock-passphrase">Passphrase</Label>
          <Input
            id="unlock-passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter your passphrase"
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUnlock();
              }
            }}
          />
        </div>
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={onUnlock}
          disabled={loading || !passphrase}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Unlocking...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Unlock
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});
