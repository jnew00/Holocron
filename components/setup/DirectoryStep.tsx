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
import { Loader2, FolderOpen } from "lucide-react";

interface DirectoryStepProps {
  onSelectDirectory: () => Promise<void>;
  loading: boolean;
  error: string;
}

export const DirectoryStep = memo(function DirectoryStep({
  onSelectDirectory,
  loading,
  error,
}: DirectoryStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Select Repository Location</CardTitle>
        <CardDescription>
          Choose where to store your encrypted notes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select an empty folder or an existing LocalNote repository. We'll create
          the necessary structure for you.
        </p>
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSelectDirectory}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <FolderOpen className="mr-2 h-4 w-4" />
              Select Folder
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});
