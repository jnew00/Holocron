import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function GET(request: NextRequest) {
  try {
    const repoPath = request.nextUrl.searchParams.get("repoPath");
    const notePath = request.nextUrl.searchParams.get("notePath");

    if (!repoPath || !notePath) {
      return NextResponse.json(
        { error: "Repository path and note path are required" },
        { status: 400 }
      );
    }

    const fullPath = path.join(repoPath, "notes", notePath);

    // Security check: ensure the path is within the repo
    const resolvedPath = path.resolve(fullPath);
    const resolvedRepoPath = path.resolve(repoPath);
    if (!resolvedPath.startsWith(resolvedRepoPath)) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 403 }
      );
    }

    const content = await fs.readFile(fullPath, "utf-8");
    const stats = await fs.stat(fullPath);

    return NextResponse.json({
      content,
      path: notePath,
      modified: stats.mtime.toISOString(),
      size: stats.size,
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to read note" },
      { status: 500 }
    );
  }
}
