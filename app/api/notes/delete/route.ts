import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function DELETE(request: NextRequest) {
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

    await fs.unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete note" },
      { status: 500 }
    );
  }
}
