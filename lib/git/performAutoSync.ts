import { commit, push, getStatus, getConfig } from "@/lib/git/gitService";

interface PerformAutoSyncOptions {
  repoPath: string;
  passphrase: string;
  messagePrefix?: string;
}

/**
 * Shared logic for performing auto-sync (commit + push)
 * Used by both interval-based and scheduled sync
 */
export async function performAutoSync({
  repoPath,
  passphrase,
  messagePrefix = "Auto-sync",
}: PerformAutoSyncOptions): Promise<void> {
  // Check if there are changes to sync
  const status = await getStatus(repoPath);
  if (!status.hasChanges) {
    console.log("[AutoSync] No changes to sync");
    return;
  }

  // Get git config for commit author
  const config = await getConfig(repoPath);

  // Auto-generate commit message
  const allChangedFiles = [
    ...(status.files?.added || []),
    ...(status.files?.modified || []),
    ...(status.files?.deleted || []),
  ];

  const noteTitles = allChangedFiles
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fileName = file.split("/").pop()?.replace(".md", "") || "";
      return fileName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    })
    .filter(Boolean);

  const commitMessage =
    noteTitles.length > 0
      ? `${messagePrefix}: ${noteTitles.length} note${noteTitles.length > 1 ? "s" : ""} updated`
      : `${messagePrefix}: Updates`;

  // Commit
  console.log("[AutoSync] Committing changes...");
  await commit(repoPath, {
    message: commitMessage,
    author: {
      name: config.name,
      email: config.email,
    },
    passphrase: passphrase,
  });

  // Push
  console.log("[AutoSync] Pushing to remote...");
  await push(repoPath, "origin");

  console.log("[AutoSync] Sync completed successfully");
}
