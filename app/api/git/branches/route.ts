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

    // Get all branches
    const { stdout } = await execAsync("git branch -a", { cwd: repoPath });

    const branches = stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const isCurrent = line.startsWith("*");
        const name = line.replace(/^\*?\s+/, "").replace(/^remotes\//, "");
        return {
          name,
          isCurrent,
          isRemote: line.includes("remotes/"),
        };
      });

    return NextResponse.json({ branches });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list branches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { repoPath, action, branchName } = await request.json();

    if (!repoPath || !action) {
      return NextResponse.json(
        { error: "Repository path and action are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "create":
        if (!branchName) {
          return NextResponse.json(
            { error: "Branch name is required" },
            { status: 400 }
          );
        }
        result = await execAsync(`git checkout -b ${branchName}`, {
          cwd: repoPath,
        });
        break;

      case "switch":
        if (!branchName) {
          return NextResponse.json(
            { error: "Branch name is required" },
            { status: 400 }
          );
        }
        result = await execAsync(`git checkout ${branchName}`, {
          cwd: repoPath,
        });
        break;

      case "delete":
        if (!branchName) {
          return NextResponse.json(
            { error: "Branch name is required" },
            { status: 400 }
          );
        }
        result = await execAsync(`git branch -d ${branchName}`, {
          cwd: repoPath,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: create, switch, or delete" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      output: result.stdout,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to perform branch operation" },
      { status: 500 }
    );
  }
}
