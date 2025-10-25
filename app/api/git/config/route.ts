import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const repoPath = request.nextUrl.searchParams.get("repoPath");

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    // Get git user name
    let name = "LocalNote User";
    try {
      const { stdout: nameOut } = await execAsync("git config user.name", {
        cwd: repoPath,
      });
      if (nameOut.trim()) {
        name = nameOut.trim();
      }
    } catch (error) {
      // Use default if not configured
    }

    // Get git user email
    let email = "user@localnote.local";
    try {
      const { stdout: emailOut } = await execAsync("git config user.email", {
        cwd: repoPath,
      });
      if (emailOut.trim()) {
        email = emailOut.trim();
      }
    } catch (error) {
      // Use default if not configured
    }

    return NextResponse.json({
      name,
      email,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get git config" },
      { status: 500 }
    );
  }
}
