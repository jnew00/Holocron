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

    // Push to remote (will use existing SSH credentials)
    const { stdout, stderr } = await execAsync(
      `git push ${remote} ${targetBranch}`,
      { cwd: repoPath }
    );

    return NextResponse.json({
      success: true,
      output: stdout || stderr,
    });
  } catch (error: any) {
    // Check for specific error conditions
    if (error.message.includes("no upstream branch")) {
      return NextResponse.json(
        {
          error:
            "No upstream branch configured. Run: git push --set-upstream origin <branch>",
        },
        { status: 400 }
      );
    }

    if (error.message.includes("rejected")) {
      return NextResponse.json(
        {
          error:
            "Push rejected. Remote has changes. Pull first or force push (not recommended).",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to push" },
      { status: 500 }
    );
  }
}
