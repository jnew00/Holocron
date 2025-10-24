import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { repoPath, message, author } = await request.json();

    if (!repoPath || !message) {
      return NextResponse.json(
        { error: "Repository path and commit message are required" },
        { status: 400 }
      );
    }

    // Stage all changes
    await execAsync("git add -A", { cwd: repoPath });

    // Create commit with author info if provided
    let commitCmd = `git commit -m "${message.replace(/"/g, '\\"')}"`;
    if (author?.name && author?.email) {
      commitCmd = `git -c user.name="${author.name}" -c user.email="${author.email}" commit -m "${message.replace(/"/g, '\\"')}"`;
    }

    const { stdout } = await execAsync(commitCmd, { cwd: repoPath });

    return NextResponse.json({
      success: true,
      output: stdout,
    });
  } catch (error: any) {
    // Check if it's a "nothing to commit" error
    if (error.message.includes("nothing to commit")) {
      return NextResponse.json({
        success: false,
        error: "No changes to commit",
      });
    }

    return NextResponse.json(
      { error: error.message || "Failed to commit" },
      { status: 500 }
    );
  }
}
