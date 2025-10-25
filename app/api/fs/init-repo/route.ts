import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: repoPath } = body;

    if (!repoPath) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Create .localnote directory structure
    const localnotePath = path.join(repoPath, ".localnote");
    await fs.mkdir(localnotePath, { recursive: true });

    // Create subdirectories
    await fs.mkdir(path.join(repoPath, "notes"), { recursive: true });
    await fs.mkdir(path.join(repoPath, "assets"), { recursive: true });
    await fs.mkdir(path.join(repoPath, "kanban"), { recursive: true });

    // Create empty config file
    const configPath = path.join(localnotePath, "config.json.enc");
    await fs.writeFile(configPath, JSON.stringify({
      version: "1.0",
      created: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: "Repository initialized successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initialize repository" },
      { status: 500 }
    );
  }
}
