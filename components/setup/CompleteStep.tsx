import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface CompleteStepProps {
  isExistingRepo: boolean;
}

export const CompleteStep = memo(function CompleteStep({
  isExistingRepo,
}: CompleteStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          {isExistingRepo ? "Repository Unlocked" : "Repository Created"}
        </CardTitle>
        <CardDescription>
          {isExistingRepo
            ? "Your notes are now accessible"
            : "Your encrypted note repository is ready"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          You can now start taking notes. All your data will be encrypted and stored
          locally in the folder you selected.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.location.reload()} className="w-full">
          Continue to LocalNote
        </Button>
      </CardFooter>
    </Card>
  );
});
