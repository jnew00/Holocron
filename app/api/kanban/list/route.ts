import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function GET(request: NextRequest) {
  try {
    const repoPath = request.nextUrl.searchParams.get("repoPath");

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    const kanbanPath = path.join(repoPath, "notes", "kanban");

    try {
      // Ensure directory exists
      await fs.mkdir(kanbanPath, { recursive: true });

      const entries = await fs.readdir(kanbanPath, { withFileTypes: true });

      const boards = [];
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".json")) {
          const fullPath = path.join(kanbanPath, entry.name);
          const stats = await fs.stat(fullPath);

          boards.push({
            name: entry.name,
            path: `kanban/${entry.name}`,
            fullPath,
            modified: stats.mtime.toISOString(),
            size: stats.size,
          });
        }
      }

      return NextResponse.json({
        boards,
        count: boards.length,
      });
    } catch (error) {
      // Directory doesn't exist or is empty
      return NextResponse.json({
        boards: [],
        count: 0,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list kanban boards" },
      { status: 500 }
    );
  }
}
