import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoPath, notePath, content } = body;

    if (!repoPath || !notePath || content === undefined) {
      return NextResponse.json(
        { error: "Repository path, note path, and content are required" },
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

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write the file
    await fs.writeFile(fullPath, content, "utf-8");

    const stats = await fs.stat(fullPath);

    return NextResponse.json({
      success: true,
      path: notePath,
      modified: stats.mtime.toISOString(),
      size: stats.size,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to write note" },
      { status: 500 }
    );
  }
}
