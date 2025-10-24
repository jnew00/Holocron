import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { repoPath, remote = "origin", branch } = await request.json();

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    // Get current branch if not specified
    let targetBranch = branch;
    if (!targetBranch) {
      const { stdout } = await execAsync("git branch --show-current", {
        cwd: repoPath,
      });
      targetBranch = stdout.trim();
    }

    // Pull from remote (will use existing SSH credentials)
    const { stdout, stderr } = await execAsync(
      `git pull ${remote} ${targetBranch}`,
      { cwd: repoPath }
    );

    // Check if there are conflicts
    const hasConflicts =
      stdout.includes("CONFLICT") || stderr.includes("CONFLICT");

    if (hasConflicts) {
      // Get list of conflicted files
      const { stdout: conflictFiles } = await execAsync(
        "git diff --name-only --diff-filter=U",
        { cwd: repoPath }
      );

      return NextResponse.json({
        success: false,
        hasConflicts: true,
        conflictedFiles: conflictFiles.trim().split("\n").filter(Boolean),
        output: stdout || stderr,
      });
    }

    return NextResponse.json({
      success: true,
      hasConflicts: false,
      output: stdout || stderr,
    });
  } catch (error: any) {
    // Check for specific error conditions
    if (error.message.includes("no tracking information")) {
      return NextResponse.json(
        {
          error:
            "No upstream branch configured. Run: git branch --set-upstream-to=origin/<branch>",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to pull" },
      { status: 500 }
    );
  }
}
