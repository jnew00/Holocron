import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { repoPath } = await request.json();

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    // Get git status
    const { stdout: status } = await execAsync("git status --porcelain", {
      cwd: repoPath,
    });

    // Get current branch
    const { stdout: branch } = await execAsync("git branch --show-current", {
      cwd: repoPath,
    });

    // Get commits ahead/behind
    let ahead = 0;
    let behind = 0;
    try {
      const { stdout: tracking } = await execAsync(
        "git rev-list --left-right --count HEAD...@{u}",
        { cwd: repoPath }
      );
      const [aheadCount, behindCount] = tracking.trim().split("\t");
      ahead = parseInt(aheadCount) || 0;
      behind = parseInt(behindCount) || 0;
    } catch (error) {
      // No upstream or not connected
    }

    // Parse status
    const lines = status.trim().split("\n").filter(Boolean);
    const modifiedFiles = lines.filter((l) => l.startsWith(" M")).map((l) => l.slice(3));
    const addedFiles = lines.filter((l) => l.startsWith("A ") || l.startsWith("??")).map((l) => l.slice(3));
    const deletedFiles = lines.filter((l) => l.startsWith(" D")).map((l) => l.slice(3));
    const untrackedFiles = lines.filter((l) => l.startsWith("??")).map((l) => l.slice(3));

    return NextResponse.json({
      branch: branch.trim(),
      modified: modifiedFiles.length,
      added: addedFiles.length,
      deleted: deletedFiles.length,
      untracked: untrackedFiles.length,
      ahead,
      behind,
      hasChanges: lines.length > 0,
      files: {
        modified: modifiedFiles,
        added: addedFiles,
        deleted: deletedFiles,
        untracked: untrackedFiles,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get git status" },
      { status: 500 }
    );
  }
}
